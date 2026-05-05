import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInWithGoogleButton } from "@/components/auth/google-auth-actions";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user?.onboardingCompleted) {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect("/onboarding");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#e2e8f0",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1020,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: 32,
            background: "linear-gradient(180deg, rgba(19,19,31,0.95), rgba(15,15,26,0.95))",
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700 }}>ORVION LABS MVP</div>
          <h1 style={{ marginTop: 18, marginBottom: 16, fontSize: 46, lineHeight: 1.05, color: "#f8fafc" }}>
            Personalized interview prep, built from your resume.
          </h1>
          <p style={{ margin: 0, maxWidth: 560, color: "#94a3b8", fontSize: 17, lineHeight: 1.8 }}>
            Turn your resume, target role, and timeline into a structured interview dashboard with prioritized
            sections, resume-specific questions, answer frameworks, and progress tracking.
          </p>

          <div style={{ marginTop: 28 }}>
            <SignInWithGoogleButton />
          </div>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { label: "Resume-based", value: "Personalized" },
              { label: "Study flow", value: "Section-wise" },
              { label: "Difficulty", value: "Tracked" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "16px 14px",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>{item.value}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: 28,
            background: "rgba(19,19,31,0.92)",
            display: "grid",
            gap: 18,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>What you get in the MVP</div>
            <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: "#94a3b8", lineHeight: 1.9, fontSize: 14 }}>
              <li>Google sign-in</li>
              <li>Interview profile onboarding</li>
              <li>Resume upload and parsing next</li>
              <li>AI-generated section roadmap</li>
              <li>Resume-specific interview dashboard</li>
            </ul>
          </div>

          <div
            style={{
              borderRadius: 20,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
              padding: 18,
            }}
          >
            <div style={{ fontSize: 14, color: "#f8fafc", fontWeight: 600 }}>Current implementation status</div>
            <div style={{ marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>
              Foundation and onboarding are being built first so the rest of the AI pipeline can attach cleanly.
            </div>
          </div>

          <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.8 }}>
            By continuing you’ll start with profile setup, then move into resume upload and kit generation as the next
            implementation task.
          </div>

          <Link href="/dashboard" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none" }}>
            Internal preview dashboard →
          </Link>
        </aside>
      </div>
    </main>
  );
}
