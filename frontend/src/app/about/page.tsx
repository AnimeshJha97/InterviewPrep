import { redirect } from "next/navigation";

import { AboutLanding } from "@/components/marketing/about-landing";
import { getAuthSession } from "@/lib/auth";

interface AboutPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return (
    <AboutLanding
      isSignedIn={Boolean(session?.user)}
      primaryCtaHref={session?.user ? "/onboarding?edit=1" : undefined}
    />
  );
}
