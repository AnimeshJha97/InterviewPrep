import { redirect } from "next/navigation";

import { HowItWorksLanding } from "@/components/marketing/how-it-works-landing";
import { getAuthSession } from "@/lib/auth";

interface HowItWorksPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function HowItWorksPage({ searchParams }: HowItWorksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return (
    <HowItWorksLanding
      isSignedIn={Boolean(session?.user)}
      primaryCtaHref={session?.user ? "/onboarding?edit=1" : undefined}
    />
  );
}
