import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { generatePrepKitFromResume } from "@/lib/interview-kit/generate-prep-kit-ai";
import { PrepKitModel } from "@/models/PrepKit";

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

  try {
    prepKit.status = "analyzing_resume";
    prepKit.errorMessage = "";
    await prepKit.save();

    const generated = await generatePrepKitFromResume({
      resumeText: prepKit.resumeText,
      onboarding: prepKit.onboarding ?? {},
    });

    prepKit.status = "generating_sections";
    prepKit.set("candidateProfile", generated.candidateProfile);
    await prepKit.save();

    prepKit.status = "generating_questions";
    prepKit.set("sections", generated.sections);
    await prepKit.save();

    prepKit.status = "completed";
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
