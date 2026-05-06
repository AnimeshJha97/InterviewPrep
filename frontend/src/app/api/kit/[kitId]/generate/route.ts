import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { generatePrepKitFromResume } from "@/lib/interview-kit/generate-prep-kit-ai";
import { PrepKitModel } from "@/models/PrepKit";
import { UserModel } from "@/models/User";

interface RouteContext {
  params: Promise<{
    kitId: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kitId } = await context.params;
  await connectToDatabase();

  const user = await UserModel.findById(session.user.id).select("plan").lean();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  });

  if (!prepKit) {
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

  if (prepKit.status === "completed") {
    return NextResponse.json({
      success: true,
      status: prepKit.status,
      prepKitId: String(prepKit._id),
    });
  }

  if (!prepKit.resumeText) {
    return NextResponse.json({ error: "Resume text is missing for this prep kit." }, { status: 400 });
  }

  if (prepKit.status === "analyzing_resume" || prepKit.status === "generating_sections" || prepKit.status === "generating_questions") {
    return NextResponse.json({
      success: true,
      status: prepKit.status,
      prepKitId: String(prepKit._id),
      alreadyRunning: true,
    });
  }

  try {
    prepKit.status = "analyzing_resume";
    prepKit.errorMessage = "";
    prepKit.set("generationMeta", {
      startedAt: new Date().toISOString(),
      stage: "analyzing_resume",
    });
    await prepKit.save();

    const generated = await generatePrepKitFromResume({
      resumeText: prepKit.resumeText,
      onboarding: prepKit.onboarding ?? {},
      plan: user?.plan ?? "free",
    });

    prepKit.status = "generating_sections";
    prepKit.set("candidateProfile", generated.candidateProfile);
    prepKit.set("generationMeta", {
      ...(generated.generationMeta ?? {}),
      startedAt: prepKit.get("generationMeta")?.startedAt,
      stage: "generating_sections",
    });
    await prepKit.save();

    prepKit.status = "generating_questions";
    prepKit.set("sections", generated.sections);
    prepKit.set("generationMeta", {
      ...(generated.generationMeta ?? {}),
      startedAt: prepKit.get("generationMeta")?.startedAt,
      stage: "generating_questions",
    });
    await prepKit.save();

    prepKit.status = "completed";
    prepKit.set("generationMeta", {
      ...(generated.generationMeta ?? {}),
      startedAt: prepKit.get("generationMeta")?.startedAt,
      completedAt: new Date().toISOString(),
      stage: "completed",
    });
    await prepKit.save();

    return NextResponse.json({
      success: true,
      status: prepKit.status,
      prepKitId: String(prepKit._id),
    });
  } catch (error) {
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
