import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/google-auth-actions";
import { InterviewPrepScreen } from "@/components/interview-prep/screen";
import { getAuthSession } from "@/lib/auth";
import { getQuestionVisibilityLimit } from "@/lib/config/plan-limits";
import { connectToDatabase } from "@/lib/db";
import { buildDashboardPrepData } from "@/lib/interview-kit/to-dashboard-data";
import { PrepKitModel } from "@/models/PrepKit";
import { UserModel } from "@/models/User";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  if (!session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  await connectToDatabase();

  const user = await UserModel.findById(session.user.id).select("latestPrepKitId").lean();
  const latestPrepKit = user?.latestPrepKitId
    ? await PrepKitModel.findById(user.latestPrepKitId)
        .select("status resumeFileName createdAt sections onboarding candidateProfile")
        .lean()
    : null;

  if (
    user?.latestPrepKitId &&
    latestPrepKit &&
    ["pending", "analyzing_resume", "generating_sections", "generating_questions"].includes(latestPrepKit.status)
  ) {
    redirect(`/generating/${String(user.latestPrepKitId)}`);
  }

  const dashboardData =
    latestPrepKit?.sections && latestPrepKit.sections.length > 0 ? buildDashboardPrepData(latestPrepKit.sections) : undefined;
  const displayRole =
    latestPrepKit?.onboarding?.targetRole || latestPrepKit?.onboarding?.currentRole || "Interview candidate";
  const extractedSkills = Array.isArray(latestPrepKit?.candidateProfile?.extractedSkills)
    ? latestPrepKit.candidateProfile.extractedSkills.slice(0, 4)
    : [];
  const emptyState = !latestPrepKit
    ? {
        title: "No prep kit yet",
        description: "Upload your resume and save your profile to let PrepWise analyze your background and create questions.",
        ctaLabel: "Upload resume",
        ctaHref: "/onboarding?edit=1",
      }
    : latestPrepKit.status === "failed"
      ? {
          title: "Generation failed",
          description:
            latestPrepKit.resumeFileName
              ? `We could not build a personalized kit from ${latestPrepKit.resumeFileName}. Go back to your profile, upload the resume again, and retry generation.`
              : "We could not build a personalized kit. Go back to your profile and upload the resume again.",
          ctaLabel: "Back to profile",
          ctaHref: "/onboarding?edit=1",
        }
      : latestPrepKit.status === "cancelled"
        ? {
            title: "Generation stopped",
            description: "Your last prep generation was stopped before questions were created. Return to your profile to upload a resume and start again.",
            ctaLabel: "Restart setup",
            ctaHref: "/onboarding?edit=1",
          }
        : {
            title: "No AI-generated questions yet",
            description: "This account does not have a completed personalized interview kit yet. Upload a resume and run generation first.",
            ctaLabel: "Go to profile",
            ctaHref: "/onboarding?edit=1",
          };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 20,
        }}
      >
        <SignOutButton />
      </div>
      {latestPrepKit && latestPrepKit.status === "completed" ? (
        <div
          style={{
            position: "fixed",
            left: 16,
            bottom: 16,
            zIndex: 20,
            display: "flex",
            justifyContent: "flex-start",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              maxWidth: 360,
              borderRadius: 14,
              border: "1px solid rgba(99,102,241,0.22)",
              background: "rgba(19,19,31,0.94)",
              color: "#cbd5e1",
              padding: "14px 18px",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "#f8fafc" }}>PrepWise AI generated this kit.</strong>
            <div style={{ marginTop: 6 }}>
              Resume: <span style={{ color: "#a5b4fc" }}>{latestPrepKit.resumeFileName}</span>
            </div>
            {extractedSkills.length > 0 ? (
              <div style={{ marginTop: 6 }}>
                Detected focus: <span style={{ color: "#f8fafc" }}>{extractedSkills.join(", ")}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <InterviewPrepScreen
        data={dashboardData}
        profileName={session.user.name ?? "Interview Prep"}
        profileRole={displayRole}
        kitId={user?.latestPrepKitId ? String(user.latestPrepKitId) : undefined}
        questionLimit={getQuestionVisibilityLimit(session.user.plan)}
        emptyState={emptyState}
      />
    </div>
  );
}
