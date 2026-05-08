import { redirect } from "next/navigation";

import { FaqLanding } from "@/components/marketing/faq-landing";
import { getAuthSession } from "@/lib/auth";

interface FaqPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function FaqPage({ searchParams }: FaqPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return <FaqLanding isSignedIn={Boolean(session?.user)} />;
}
