import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { PrepKitModel } from "@/models/PrepKit";

interface RouteContext {
  params: Promise<{
    kitId: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kitId } = await context.params;
  await connectToDatabase();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  }).lean();

  if (!prepKit) {
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

  return NextResponse.json({
    kit: {
      id: String(prepKit._id),
      status: prepKit.status,
      resumeFileName: prepKit.resumeFileName,
      resumeUrl: prepKit.resumeUrl,
      onboarding: prepKit.onboarding ?? {},
      candidateProfile: prepKit.candidateProfile ?? {},
      sections: prepKit.sections ?? [],
      errorMessage: prepKit.errorMessage ?? "",
      createdAt: prepKit.createdAt?.toISOString?.() ?? null,
      updatedAt: prepKit.updatedAt?.toISOString?.() ?? null,
    },
  });
}
