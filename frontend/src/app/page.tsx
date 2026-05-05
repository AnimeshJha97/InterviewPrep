import { redirect } from "next/navigation";

import { SignInWithGoogleButton, SignOutButton } from "@/components/auth/google-auth-actions";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 30%), linear-gradient(180deg, #0b1120, #0f0f1a)",
        color: "#e2e8f0",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      {session?.user ? (
        <div
          style={{
            position: "fixed",
            right: 20,
            top: 20,
            zIndex: 20,
          }}
        >
          <SignOutButton />
        </div>
      ) : null}

      <div
        style={{
          width: "100%",
          maxWidth: 860,
        }}
      >
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 32,
            padding: "42px 40px",
            background: "linear-gradient(180deg, rgba(19,19,31,0.96), rgba(15,15,26,0.96))",
            boxShadow: "0 32px 90px rgba(2,6,23,0.45)",
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: 2.4, color: "#818cf8", fontWeight: 700 }}>PREPWISE BY ORVION LABS</div>
          <h1 style={{ marginTop: 18, marginBottom: 16, fontSize: 52, lineHeight: 1.02, color: "#f8fafc" }}>
            AI interview prep built around your actual resume.
          </h1>
          <p style={{ margin: 0, maxWidth: 640, color: "#94a3b8", fontSize: 17, lineHeight: 1.9 }}>
            PrepWise analyzes your skills, projects, experience, and target role to build a personalized interview
            workspace. You get resume-aware questions, guided answers, follow-up prompts, and a section-wise prep plan
            instead of a generic question list.
          </p>

          <div
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {[
              { title: "Resume-aware", text: "Questions tied to your stack, projects, and level." },
              { title: "Structured prep", text: "Sections, priorities, and estimated effort per topic." },
              { title: "Practice loop", text: "Track completion, save notes, and refine answers over time." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "18px 16px",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: "#94a3b8" }}>{item.text}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              borderRadius: 20,
              border: "1px solid rgba(99,102,241,0.18)",
              background: "rgba(99,102,241,0.1)",
              padding: "18px 20px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>How it works</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e1" }}>
              Sign in, upload your resume, choose your target role, and let PrepWise generate a tailored interview
              dashboard. You then practice from questions designed for your own background, not a one-size-fits-all
              syllabus.
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            {session?.user ? (
              <a
                href="/onboarding"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 20px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.24), rgba(168,85,247,0.22))",
                  color: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Continue setup
              </a>
            ) : (
              <SignInWithGoogleButton />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
