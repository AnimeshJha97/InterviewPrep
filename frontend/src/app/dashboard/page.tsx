import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/google-auth-actions";
import { InterviewPrepScreen } from "@/components/interview-prep/screen";
import { getAuthSession } from "@/lib/auth";
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

  if (user?.latestPrepKitId && latestPrepKit && latestPrepKit.status !== "completed") {
    redirect(`/generating/${String(user.latestPrepKitId)}`);
  }

  const dashboardData =
    latestPrepKit?.sections && latestPrepKit.sections.length > 0 ? buildDashboardPrepData(latestPrepKit.sections) : undefined;
  const displayRole =
    latestPrepKit?.onboarding?.targetRole || latestPrepKit?.onboarding?.currentRole || "Interview candidate";

  return (
    <div>
      <div
        style={{
          position: "fixed",
          right: 16,
          top: 16,
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
            right: 16,
            top: 16,
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              maxWidth: 760,
              width: "100%",
              borderRadius: 14,
              border: "1px solid rgba(99,102,241,0.22)",
              background: "rgba(19,19,31,0.94)",
              color: "#cbd5e1",
              padding: "14px 18px",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "#f8fafc" }}>Resume uploaded.</strong> Prep kit record created for{" "}
            <span style={{ color: "#a5b4fc" }}>{latestPrepKit.resumeFileName}</span> with status{" "}
            <span style={{ color: "#f8fafc" }}>{latestPrepKit.status}</span>. Your dashboard is now using generated sections from this kit.
          </div>
        </div>
      ) : null}
      <InterviewPrepScreen
        data={dashboardData}
        profileName={session.user.name ?? "Interview Prep"}
        profileRole={displayRole}
        kitId={user?.latestPrepKitId ? String(user.latestPrepKitId) : undefined}
        questionLimit={session.user.plan === "free" ? 10 : undefined}
      />
    </div>
  );
}
