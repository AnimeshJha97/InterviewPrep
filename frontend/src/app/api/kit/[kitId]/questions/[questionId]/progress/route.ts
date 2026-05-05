import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { PrepKitModel } from "@/models/PrepKit";

interface RouteContext {
  params: Promise<{
    kitId: string;
    questionId: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { isCompleted?: boolean } | null;

  if (typeof payload?.isCompleted !== "boolean") {
    return NextResponse.json({ error: "isCompleted must be a boolean." }, { status: 400 });
  }

  const { kitId, questionId } = await context.params;
  await connectToDatabase();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  });

  if (!prepKit) {
    return NextResponse.json({ error: "Prep kit not found." }, { status: 404 });
  }

  const sections = prepKit.get("sections") as Array<{
    questions?: Array<{
      id: string;
      isCompleted?: boolean;
    }>;
  }>;

  let updated = false;

  for (const section of sections) {
    const question = section.questions?.find((item) => item.id === questionId);

    if (question) {
      question.isCompleted = payload.isCompleted;
      updated = true;
      break;
    }
  }

  if (!updated) {
    return NextResponse.json({ error: "Question not found in prep kit." }, { status: 404 });
  }

  await prepKit.save();

  return NextResponse.json({ success: true });
}
