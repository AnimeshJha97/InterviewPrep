import { redirect } from "next/navigation";

import { FeaturesLanding } from "@/components/marketing/features-landing";
import { getAuthSession } from "@/lib/auth";

interface FeaturesPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function FeaturesPage({ searchParams }: FeaturesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return (
    <FeaturesLanding
      isSignedIn={Boolean(session?.user)}
      primaryCtaHref={session?.user ? "/onboarding?edit=1" : undefined}
    />
  );
}
