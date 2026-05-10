import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestId, logger } from "@/lib/logger";
import { PrepKitModel } from "@/models/PrepKit";
import { UserModel } from "@/models/User";

interface RouteContext {
  params: Promise<{
    kitId: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const requestId = createRequestId("kit_cancel");
  const session = await getAuthSession();

  if (!session?.user?.id) {
    logger.required.warn("kit.cancel.unauthorized", { requestId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kitId } = await context.params;
  await connectToDatabase();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  });

  if (!prepKit) {
    logger.required.warn("kit.cancel.not_found", { requestId, userId: session.user.id, kitId });
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

  const previousStatus = prepKit.status;
  prepKit.status = "cancelled";
  prepKit.set("generationMeta", {
    ...(prepKit.get("generationMeta") ?? {}),
    stage: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
  await prepKit.save();

  await UserModel.findByIdAndUpdate(session.user.id, {
    $set: {
      latestPrepKitId: null,
    },
  });

  logger.required.info("kit.cancel.completed", {
    requestId,
    userId: session.user.id,
    kitId,
    previousStatus,
  });

  return NextResponse.json({ success: true });
}
