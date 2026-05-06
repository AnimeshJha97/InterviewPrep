import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getFreePlanRetargetLimit } from "@/lib/config/plan-limits";
import { connectToDatabase } from "@/lib/db";
import { onboardingSchema } from "@/lib/validators";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid onboarding data",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  await connectToDatabase();

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

  return NextResponse.json({
    success: true,
    user,
  });
}
