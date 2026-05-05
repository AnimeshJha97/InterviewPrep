import { redirect } from "next/navigation";

import { connectToDatabase } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { UserModel } from "@/models/User";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  await connectToDatabase();

  const user = await UserModel.findById(session.user.id).select("onboarding onboardingCompleted").lean();

  if (user?.onboardingCompleted) {
    redirect("/dashboard");
  }

  const initialValues = user?.onboarding
    ? {
        currentRole: user.onboarding.currentRole ?? undefined,
        targetRole: user.onboarding.targetRole ?? undefined,
        yearsOfExperience: user.onboarding.yearsOfExperience ?? undefined,
        interviewType: user.onboarding.interviewType ?? undefined,
        targetCompany: user.onboarding.targetCompany ?? undefined,
        jobDescription: user.onboarding.jobDescription ?? undefined,
        confidenceLevel: user.onboarding.confidenceLevel ?? undefined,
        timelineDays: user.onboarding.timelineDays ?? undefined,
      }
    : undefined;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#e2e8f0",
        padding: "48px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          background: "rgba(19,19,31,0.92)",
          padding: 28,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700 }}>ONBOARDING</div>
        <h1 style={{ marginTop: 12, marginBottom: 10, fontSize: 32, lineHeight: 1.2, color: "#f8fafc" }}>
          Build your personalized interview prep kit
        </h1>
        <p style={{ margin: 0, marginBottom: 24, color: "#94a3b8", fontSize: 15, lineHeight: 1.7 }}>
          Tell us your current role, target role, experience level, and timeline. This becomes the base layer for
          resume analysis, AI section generation, and question prioritization.
        </p>

        <OnboardingForm initialValues={initialValues} />
      </div>
    </main>
  );
}
