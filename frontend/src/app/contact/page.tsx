import { redirect } from "next/navigation";

import { ContactLanding } from "@/components/marketing/contact-landing";
import { getAuthSession } from "@/lib/auth";

interface ContactPageProps {
  searchParams?: Promise<{
    stay?: string;
  }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allowStay = resolvedSearchParams?.stay === "1";
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted && !allowStay) {
    redirect("/dashboard");
  }

  return (
    <ContactLanding
      isSignedIn={Boolean(session?.user)}
      primaryCtaHref={session?.user ? "/onboarding?edit=1" : undefined}
    />
  );
}
