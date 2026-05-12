import { HomeLanding } from "@/components/marketing/home-landing";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <HomeLanding
      isSignedIn={Boolean(session?.user)}
      primaryCtaHref={session?.user ? "/onboarding?edit=1" : undefined}
    />
  );
}
