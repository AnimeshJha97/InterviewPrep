import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
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

  const user = await UserModel.findByIdAndUpdate(
    session.user.id,
    {
      $set: {
        name: parsed.data.fullName,
        onboarding: parsed.data,
        onboardingCompleted: true,
      },
    },
    { returnDocument: "after" },
  ).lean();

  return NextResponse.json({
    success: true,
    user,
  });
}
