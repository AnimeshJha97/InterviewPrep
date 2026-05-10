type LogLevel = "info" | "warn" | "error";
type LogKind = "required" | "temporary";

type LogMeta = Record<string, unknown>;

const sensitiveKeyPattern = /(secret|token|key|password|authorization|cookie|resumeText|contents|prompt)/i;

function isEnabled(value: string | undefined, defaultValue: boolean) {
  if (!value) {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function sanitize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: isEnabled(process.env.PREPWISE_TEMP_LOGS, false) ? value.stack : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as LogMeta).map(([key, entry]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[redacted]" : sanitize(entry),
      ]),
    );
  }

  return value;
}

function shouldLog(kind: LogKind) {
  if (kind === "required") {
    return isEnabled(process.env.PREPWISE_REQUIRED_LOGS, true);
  }

  return isEnabled(process.env.PREPWISE_TEMP_LOGS, false);
}

function shouldPersist(kind: LogKind) {
  if (kind === "required") {
    return isEnabled(process.env.PREPWISE_DB_REQUIRED_LOGS, true);
  }

  return isEnabled(process.env.PREPWISE_DB_TEMP_LOGS, false);
}

async function persistActivityLog(kind: LogKind, level: LogLevel, event: string, meta: LogMeta) {
  if (!shouldPersist(kind)) {
    return;
  }

  try {
    const [{ connectToDatabase }, { ActivityLogModel }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/ActivityLog"),
    ]);

    await connectToDatabase();
    await ActivityLogModel.create({
      kind,
      level,
      event,
      requestId: typeof meta.requestId === "string" ? meta.requestId : undefined,
      userId: typeof meta.userId === "string" ? meta.userId : undefined,
      kitId: typeof meta.kitId === "string" ? meta.kitId : undefined,
      route: typeof meta.route === "string" ? meta.route : undefined,
      meta: sanitize(meta),
    });
  } catch (error) {
    console.warn(
      JSON.stringify({
        app: "prepwise",
        kind: "required",
        level: "warn",
        event: "activity_log.persist_failed",
        timestamp: new Date().toISOString(),
        error: sanitize(error),
      }),
    );
  }
}

function writeLog(kind: LogKind, level: LogLevel, event: string, meta: LogMeta = {}) {
  if (!shouldLog(kind) && !shouldPersist(kind)) {
    return;
  }

  const payload = {
    app: "prepwise",
    kind,
    level,
    event,
    timestamp: new Date().toISOString(),
    ...(sanitize(meta) as LogMeta),
  };

  const line = JSON.stringify(payload);

  if (!shouldLog(kind)) {
    void persistActivityLog(kind, level, event, meta);
    return;
  }

  if (level === "error") {
    console.error(line);
    void persistActivityLog(kind, level, event, meta);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    void persistActivityLog(kind, level, event, meta);
    return;
  }

  console.info(line);
  void persistActivityLog(kind, level, event, meta);
}

export function createRequestId(prefix = "req") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const logger = {
  required: {
    info: (event: string, meta?: LogMeta) => writeLog("required", "info", event, meta),
    warn: (event: string, meta?: LogMeta) => writeLog("required", "warn", event, meta),
    error: (event: string, meta?: LogMeta) => writeLog("required", "error", event, meta),
  },
  temporary: {
    info: (event: string, meta?: LogMeta) => writeLog("temporary", "info", event, meta),
    warn: (event: string, meta?: LogMeta) => writeLog("temporary", "warn", event, meta),
    error: (event: string, meta?: LogMeta) => writeLog("temporary", "error", event, meta),
  },
};
