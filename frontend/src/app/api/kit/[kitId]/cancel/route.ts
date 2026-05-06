import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
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

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  });

  if (!prepKit) {
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

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

  return NextResponse.json({ success: true });
}
