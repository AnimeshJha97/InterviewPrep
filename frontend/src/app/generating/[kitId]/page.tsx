import { redirect } from "next/navigation";

import { GenerationStatusClient } from "@/components/generating/generation-status-client";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { PrepKitModel } from "@/models/PrepKit";

interface GeneratingPageProps {
  params: Promise<{
    kitId: string;
  }>;
}

export default async function GeneratingPage({ params }: GeneratingPageProps) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const { kitId } = await params;

  await connectToDatabase();

  const prepKit = await PrepKitModel.findOne({
    _id: kitId,
    userId: session.user.id,
  })
    .select("status resumeFileName")
    .lean();

  if (!prepKit) {
    redirect("/dashboard");
  }

  return (
    <GenerationStatusClient
      kitId={kitId}
      initialStatus={prepKit.status}
      initialFileName={prepKit.resumeFileName || "Uploaded resume"}
    />
  );
}
