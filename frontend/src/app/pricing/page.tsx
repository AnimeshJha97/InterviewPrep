import { redirect } from "next/navigation";

import { PricingLanding } from "@/components/marketing/pricing-landing";
import { getAuthSession } from "@/lib/auth";

interface PricingPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return (
    <PricingLanding
      isSignedIn={Boolean(session?.user)}
      primaryCtaHref={session?.user ? "/onboarding?edit=1" : undefined}
    />
  );
}
