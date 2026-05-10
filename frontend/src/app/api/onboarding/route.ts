import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getFreePlanRetargetLimit } from "@/lib/config/plan-limits";
import { connectToDatabase } from "@/lib/db";
import { createRequestId, logger } from "@/lib/logger";
import { assertRateLimit, rateLimitConfig } from "@/lib/rate-limit";
import { onboardingSchema } from "@/lib/validators";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const requestId = createRequestId("onboarding");
  const session = await getAuthSession();

  if (!session?.user?.id) {
    logger.required.warn("onboarding.save.unauthorized", { requestId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.required.info("onboarding.save.started", { requestId, userId: session.user.id });

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    logger.required.warn("onboarding.save.invalid", { requestId, userId: session.user.id });
    return NextResponse.json(
      {
        error: "Invalid onboarding data",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  await connectToDatabase();

  const rateLimit = await assertRateLimit({
    key: `onboarding:${session.user.id}`,
    limit: rateLimitConfig.onboardingLimit,
    windowMs: rateLimitConfig.windowMs,
  });

  if (!rateLimit.allowed) {
    logger.required.warn("onboarding.save.rate_limited", {
      requestId,
      userId: session.user.id,
      count: rateLimit.count,
      limit: rateLimit.limit,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return NextResponse.json(
      { error: "Too many profile updates. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const existingUser = await UserModel.findById(session.user.id)
    .select("plan onboarding onboardingCompleted profileRetargetCount")
    .lean();

  const previousOnboarding = existingUser?.onboarding;
  const isRetargetUpdate =
    Boolean(existingUser?.onboardingCompleted && previousOnboarding) &&
    (
      (previousOnboarding?.targetRole ?? "").trim() !== parsed.data.targetRole.trim() ||
      (previousOnboarding?.jobDescription ?? "").trim() !== (parsed.data.jobDescription ?? "").trim()
    );

  if (
    existingUser?.plan === "free" &&
    isRetargetUpdate &&
    (existingUser.profileRetargetCount ?? 0) >= getFreePlanRetargetLimit()
  ) {
    logger.required.warn("onboarding.save.retarget_limit_reached", { requestId, userId: session.user.id });
    return NextResponse.json(
      {
        error: "Free plan retarget limit reached. You can change target role and job description only once on the free tier.",
      },
      { status: 403 },
    );
  }

  const user = await UserModel.findByIdAndUpdate(
    session.user.id,
    {
      $set: {
        name: parsed.data.fullName,
        onboarding: parsed.data,
        onboardingCompleted: true,
      },
      ...(isRetargetUpdate
        ? {
            $inc: {
              profileRetargetCount: 1,
            },
          }
        : {}),
    },
    { returnDocument: "after" },
  ).lean();

  logger.required.info("onboarding.save.completed", {
    requestId,
    userId: session.user.id,
    isRetargetUpdate,
    plan: existingUser?.plan ?? "free",
  });

  return NextResponse.json({
    requestId,
    success: true,
    user,
  });
}
