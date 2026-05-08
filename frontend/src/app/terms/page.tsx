import { redirect } from "next/navigation";

import { TermsLanding } from "@/components/marketing/terms-landing";
import { getAuthSession } from "@/lib/auth";

interface TermsPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return <TermsLanding isSignedIn={Boolean(session?.user)} />;
}
