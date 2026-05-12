import { RateLimitModel } from "@/models/RateLimit";

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function assertRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  let record = await RateLimitModel.findOne({ key });

  if (!record || record.expiresAt <= now) {
    record = await RateLimitModel.findOneAndUpdate(
      { key },
      {
        $set: {
          key,
          count: 1,
          expiresAt,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  } else {
    record.count += 1;
    await record.save();
  }

  const count = record?.count ?? 1;
  const retryAfterSeconds = Math.max(1, Math.ceil(((record?.expiresAt ?? expiresAt).getTime() - now.getTime()) / 1000));

  return {
    allowed: count <= limit,
    count,
    limit,
    retryAfterSeconds,
  };
}

export const rateLimitConfig = {
  resumeUploadLimit: readNumber(process.env.P3KIT_RATE_LIMIT_RESUME_UPLOADS_PER_HOUR, 6),
  kitGenerateLimit: readNumber(process.env.P3KIT_RATE_LIMIT_KIT_GENERATIONS_PER_HOUR, 4),
  onboardingLimit: readNumber(process.env.P3KIT_RATE_LIMIT_ONBOARDING_PER_HOUR, 12),
  geminiRequestsPerMinute: readNumber(process.env.P3KIT_GEMINI_REQUESTS_PER_MINUTE, 4),
  windowMs: 60 * 60 * 1000,
};
