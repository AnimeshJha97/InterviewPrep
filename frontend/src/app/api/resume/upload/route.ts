import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestId, logger } from "@/lib/logger";
import { assertRateLimit, rateLimitConfig } from "@/lib/rate-limit";
import { extractResumeText } from "@/lib/resume-parser";
import { PrepKitModel } from "@/models/PrepKit";
import { UserModel } from "@/models/User";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSizeInBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const requestId = createRequestId("resume_upload");
  const session = await getAuthSession();

  if (!session?.user?.id) {
    logger.required.warn("resume.upload.unauthorized", { requestId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.required.info("resume.upload.started", { requestId, userId: session.user.id });

  await connectToDatabase();
  const rateLimit = await assertRateLimit({
    key: `resume-upload:${session.user.id}`,
    limit: rateLimitConfig.resumeUploadLimit,
    windowMs: rateLimitConfig.windowMs,
  });

  if (!rateLimit.allowed) {
    logger.required.warn("resume.upload.rate_limited", {
      requestId,
      userId: session.user.id,
      count: rateLimit.count,
      limit: rateLimit.limit,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return NextResponse.json(
      { error: "Too many resume uploads. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const formData = await request.formData();
  const resume = formData.get("resume");

  if (!(resume instanceof File)) {
    logger.required.warn("resume.upload.missing_file", { requestId, userId: session.user.id });
    return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
  }

  logger.required.info("resume.upload.file_received", {
    requestId,
    userId: session.user.id,
    fileName: resume.name,
    fileSize: resume.size,
    mimeType: resume.type,
  });

  if (!allowedMimeTypes.includes(resume.type)) {
    logger.required.warn("resume.upload.unsupported_type", {
      requestId,
      userId: session.user.id,
      fileName: resume.name,
      mimeType: resume.type,
    });
    return NextResponse.json({ error: "Only PDF and DOCX resumes are supported right now." }, { status: 400 });
  }

  if (resume.size > maxFileSizeInBytes) {
    logger.required.warn("resume.upload.file_too_large", {
      requestId,
      userId: session.user.id,
      fileName: resume.name,
      fileSize: resume.size,
    });
    return NextResponse.json({ error: "Resume exceeds the 5MB file limit." }, { status: 400 });
  }

  const arrayBuffer = await resume.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  let resumeText = "";

  try {
    resumeText = await extractResumeText(fileBuffer, resume.name, resume.type, requestId);
  } catch (error) {
    logger.required.error("resume.upload.parse_failed", {
      requestId,
      userId: session.user.id,
      fileName: resume.name,
      error,
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse resume.",
      },
      { status: 400 },
    );
  }

  if (!resumeText) {
    logger.required.warn("resume.upload.empty_text", {
      requestId,
      userId: session.user.id,
      fileName: resume.name,
    });
    return NextResponse.json({ error: "Could not extract text from the uploaded resume." }, { status: 400 });
  }

  logger.temporary.info("resume.upload.db_connected", { requestId, userId: session.user.id });

  const user = await UserModel.findById(session.user.id).select("onboarding plan").lean();

  if (user?.plan === "free") {
    const existingKitCount = await PrepKitModel.countDocuments({
      userId: session.user.id,
      status: {
        $nin: ["failed", "cancelled"],
      },
    });

    if (existingKitCount >= 1) {
      logger.required.warn("resume.upload.free_limit_reached", {
        requestId,
        userId: session.user.id,
        existingKitCount,
      });
      return NextResponse.json(
        {
          error: "Free plan currently allows one generated prep kit. Upgrade will unlock multiple personalized kits.",
        },
        { status: 403 },
      );
    }
  }

  const prepKit = await PrepKitModel.create({
    userId: session.user.id,
    status: "pending",
    resumeFileName: resume.name,
    resumeUrl: "",
    resumeText,
    onboarding: user?.onboarding ?? {},
    candidateProfile: {},
    sections: [],
    generationMeta: {
      uploadedAt: new Date().toISOString(),
      fileSize: resume.size,
      mimeType: resume.type,
    },
  });

  await UserModel.findByIdAndUpdate(session.user.id, {
    $set: {
      latestPrepKitId: prepKit._id,
    },
  });

  logger.required.info("resume.upload.completed", {
    requestId,
    userId: session.user.id,
    prepKitId: String(prepKit._id),
    extractedCharacters: resumeText.length,
    plan: user?.plan ?? "free",
  });

  return NextResponse.json({
    success: true,
    prepKitId: String(prepKit._id),
    extractedCharacters: resumeText.length,
  });
}
