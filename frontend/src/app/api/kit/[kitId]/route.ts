import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestId, logger } from "@/lib/logger";
import { PrepKitModel } from "@/models/PrepKit";

interface RouteContext {
  params: Promise<{
    kitId: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const requestId = createRequestId("kit_get");
  const session = await getAuthSession();

  if (!session?.user?.id) {
    logger.required.warn("kit.get.unauthorized", { requestId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kitId } = await context.params;
  await connectToDatabase();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  }).lean();

  if (!prepKit) {
    logger.required.warn("kit.get.not_found", { requestId, userId: session.user.id, kitId });
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

  logger.temporary.info("kit.get.completed", {
    requestId,
    userId: session.user.id,
    kitId,
    status: prepKit.status,
    sectionCount: prepKit.sections?.length ?? 0,
  });

  return NextResponse.json({
    kit: {
      id: String(prepKit._id),
      status: prepKit.status,
      resumeFileName: prepKit.resumeFileName,
      resumeUrl: prepKit.resumeUrl,
      onboarding: prepKit.onboarding ?? {},
      candidateProfile: prepKit.candidateProfile ?? {},
      sections: prepKit.sections ?? [],
      generationMeta: prepKit.generationMeta ?? {},
      errorMessage: prepKit.errorMessage ?? "",
      createdAt: prepKit.createdAt?.toISOString?.() ?? null,
      updatedAt: prepKit.updatedAt?.toISOString?.() ?? null,
    },
  });
}
