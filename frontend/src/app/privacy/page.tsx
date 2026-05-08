import { redirect } from "next/navigation";

import { PrivacyLanding } from "@/components/marketing/privacy-landing";
import { getAuthSession } from "@/lib/auth";

interface PrivacyPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return <PrivacyLanding isSignedIn={Boolean(session?.user)} />;
}
