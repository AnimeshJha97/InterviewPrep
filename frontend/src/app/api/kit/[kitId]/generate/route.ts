import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { generatePrepKitFromResume } from "@/lib/interview-kit/generate-prep-kit-ai";
import { createRequestId, logger } from "@/lib/logger";
import { assertRateLimit, rateLimitConfig } from "@/lib/rate-limit";
import { PrepKitModel } from "@/models/PrepKit";
import { UserModel } from "@/models/User";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{
    kitId: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const requestId = createRequestId("kit_generate");
  const session = await getAuthSession();

  if (!session?.user?.id) {
    logger.required.warn("kit.generate.unauthorized", { requestId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kitId } = await context.params;
  logger.required.info("kit.generate.started", { requestId, userId: session.user.id, kitId });
  await connectToDatabase();

  const rateLimit = await assertRateLimit({
    key: `kit-generate:${session.user.id}`,
    limit: rateLimitConfig.kitGenerateLimit,
    windowMs: rateLimitConfig.windowMs,
  });

  if (!rateLimit.allowed) {
    logger.required.warn("kit.generate.rate_limited", {
      requestId,
      userId: session.user.id,
      kitId,
      count: rateLimit.count,
      limit: rateLimit.limit,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return NextResponse.json(
      { error: "Too many kit generation attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const user = await UserModel.findById(session.user.id).select("plan").lean();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  });

  if (!prepKit) {
    logger.required.warn("kit.generate.not_found", { requestId, userId: session.user.id, kitId });
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

  if (prepKit.status === "completed") {
    logger.required.info("kit.generate.already_completed", { requestId, userId: session.user.id, kitId });
    return NextResponse.json({
      success: true,
      status: prepKit.status,
      prepKitId: String(prepKit._id),
    });
  }

  if (!prepKit.resumeText) {
    logger.required.warn("kit.generate.missing_resume_text", { requestId, userId: session.user.id, kitId });
    return NextResponse.json({ error: "Resume text is missing for this prep kit." }, { status: 400 });
  }

  if (prepKit.status === "cancelled") {
    logger.required.warn("kit.generate.cancelled", { requestId, userId: session.user.id, kitId });
    return NextResponse.json({ error: "Prep kit generation was cancelled." }, { status: 409 });
  }

  const runningStatuses = ["analyzing_resume", "generating_sections", "generating_questions"];
  const updatedAt = prepKit.get("updatedAt") as Date | undefined;
  const isStaleRun = updatedAt ? Date.now() - updatedAt.getTime() > 4 * 60 * 1000 : false;

  if (runningStatuses.includes(prepKit.status) && !isStaleRun) {
    logger.required.info("kit.generate.already_running", {
      requestId,
      userId: session.user.id,
      kitId,
      status: prepKit.status,
    });
    return NextResponse.json({
      success: true,
      status: prepKit.status,
      prepKitId: String(prepKit._id),
      alreadyRunning: true,
    });
  }

  if (runningStatuses.includes(prepKit.status) && isStaleRun) {
    const previousStage = prepKit.status;
    logger.required.warn("kit.generate.recovering_stale_run", {
      requestId,
      userId: session.user.id,
      kitId,
      previousStage,
      updatedAt,
    });
    prepKit.status = "pending";
    prepKit.errorMessage = "";
    prepKit.set("generationMeta", {
      ...(prepKit.get("generationMeta") ?? {}),
      recoveredAt: new Date().toISOString(),
      previousStage,
    });
    await prepKit.save();
  }

  try {
    prepKit.status = "analyzing_resume";
    prepKit.errorMessage = "";
    prepKit.set("generationMeta", {
      startedAt: new Date().toISOString(),
      stage: "analyzing_resume",
    });
    await prepKit.save();
    logger.required.info("kit.generate.stage_saved", {
      requestId,
      userId: session.user.id,
      kitId,
      stage: "analyzing_resume",
      plan: user?.plan ?? "free",
      resumeCharacters: prepKit.resumeText.length,
    });

    const generated = await generatePrepKitFromResume({
      resumeText: prepKit.resumeText,
      onboarding: prepKit.onboarding ?? {},
      plan: user?.plan ?? "free",
      requestId,
    });

    const refreshedPrepKit = await PrepKitModel.findById(prepKit._id).select("status").lean();
    if (refreshedPrepKit?.status === "cancelled") {
      logger.required.warn("kit.generate.cancelled_after_ai", { requestId, userId: session.user.id, kitId });
      return NextResponse.json({ success: false, status: "cancelled" }, { status: 409 });
    }

    prepKit.status = "generating_sections";
    prepKit.set("candidateProfile", generated.candidateProfile);
    prepKit.set("generationMeta", {
      ...(generated.generationMeta ?? {}),
      startedAt: prepKit.get("generationMeta")?.startedAt,
      stage: "generating_sections",
    });
    await prepKit.save();
    logger.required.info("kit.generate.stage_saved", {
      requestId,
      userId: session.user.id,
      kitId,
      stage: "generating_sections",
      sectionCount: generated.sections.length,
    });

    prepKit.status = "generating_questions";
    prepKit.set("sections", generated.sections);
    prepKit.set("generationMeta", {
      ...(generated.generationMeta ?? {}),
      startedAt: prepKit.get("generationMeta")?.startedAt,
      stage: "generating_questions",
    });
    await prepKit.save();
    logger.required.info("kit.generate.stage_saved", {
      requestId,
      userId: session.user.id,
      kitId,
      stage: "generating_questions",
      totalQuestions: generated.sections.reduce((sum, section) => sum + section.questions.length, 0),
    });

    prepKit.status = "completed";
    prepKit.set("generationMeta", {
      ...(generated.generationMeta ?? {}),
      startedAt: prepKit.get("generationMeta")?.startedAt,
      completedAt: new Date().toISOString(),
      stage: "completed",
    });
    await prepKit.save();
    logger.required.info("kit.generate.completed", {
      requestId,
      userId: session.user.id,
      kitId,
      sectionCount: generated.sections.length,
      totalQuestions: generated.sections.reduce((sum, section) => sum + section.questions.length, 0),
    });

    return NextResponse.json({
      success: true,
      status: prepKit.status,
      prepKitId: String(prepKit._id),
    });
  } catch (error) {
    logger.required.error("kit.generate.failed", {
      requestId,
      userId: session.user.id,
      kitId,
      status: prepKit.status,
      error,
    });
    prepKit.status = "failed";
    prepKit.errorMessage = error instanceof Error ? error.message : "Failed to generate prep kit.";
    await prepKit.save();

    return NextResponse.json(
      {
        error: prepKit.errorMessage,
      },
      { status: 500 },
    );
  }
}
