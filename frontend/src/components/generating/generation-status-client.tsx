"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { PrepKitStatus } from "@/types/prep-kit";

const statusCopy: Record<PrepKitStatus, { title: string; detail: string }> = {
  pending: {
    title: "Preparing your personalized interview workspace",
    detail: "Your profile is locked in. We are about to start building a question set tailored to your resume and target role.",
  },
  analyzing_resume: {
    title: "Analyzing your resume, projects, and experience",
    detail: "Our specialists are mapping your skills, projects, years of experience, and likely interview pressure points.",
  },
  generating_sections: {
    title: "Designing your section-wise prep roadmap",
    detail: "We are prioritizing the topics that matter most for your timeline, target role, and target company context.",
  },
  generating_questions: {
    title: "Creating your personalized interview questions",
    detail: "We are generating resume-aware questions, follow-ups, and answer guidance based on your actual background.",
  },
  completed: {
    title: "Your prep kit is ready",
    detail: "Redirecting you to the dashboard now.",
  },
  failed: {
    title: "Generation hit a problem",
    detail: "You can retry the generation without re-uploading the resume.",
  },
  cancelled: {
    title: "Generation stopped",
    detail: "The current prep creation flow was stopped. You can return to the form and start again when ready.",
  },
};

interface GenerationStatusClientProps {
  kitId: string;
  initialStatus: PrepKitStatus;
  initialFileName: string;
}

export function GenerationStatusClient({
  kitId,
  initialStatus,
  initialFileName,
}: GenerationStatusClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PrepKitStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasStarted, setHasStarted] = useState(initialStatus !== "pending");
  const [isStopping, setIsStopping] = useState(false);
  const pollingRef = useRef<number | null>(null);
  const requestStartedRef = useRef(false);
  const pollCountRef = useRef(0);
  const redirectTimeoutRef = useRef<number | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const rotatingMessages = [
    "Your personalized questions are being created.",
    "Our specialists are tailoring the kit to your resume and goals.",
    "We are aligning difficulty, projects, and likely interview rounds.",
  ];

  const currentCopy = useMemo(() => statusCopy[status], [status]);

  useEffect(() => {
    let isCancelled = false;

    const triggerGeneration = async () => {
      requestStartedRef.current = true;
      try {
        const response = await fetch(`/api/kit/${kitId}/generate`, {
          method: "POST",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Generation failed.");
        }

        if (!isCancelled) {
          setHasStarted(true);
        }
      } catch (error) {
        if (!isCancelled) {
          setStatus("failed");
          setErrorMessage(error instanceof Error ? error.message : "Generation failed.");
        }
      }
    };

    if (!hasStarted && status !== "completed" && !requestStartedRef.current) {
      void triggerGeneration();
    }

    return () => {
      isCancelled = true;
    };
  }, [hasStarted, kitId, status]);

  useEffect(() => {
    const poll = async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > 60) {
        setStatus("failed");
        setErrorMessage("Generation timed out. Please return and try again.");
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      const response = await fetch(`/api/kit/${kitId}`, { cache: "no-store" });

      if (!response.ok) {
        setStatus("failed");
        setErrorMessage("Could not refresh kit status.");
        return;
      }

      const payload = (await response.json()) as {
        kit: {
          status: PrepKitStatus;
          errorMessage?: string;
        };
      };

      setStatus(payload.kit.status);
      setErrorMessage(payload.kit.errorMessage ?? "");

      if (payload.kit.status === "completed") {
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        redirectTimeoutRef.current = window.setTimeout(() => router.replace("/dashboard"), 900);
      }

      if (payload.kit.status === "failed" || payload.kit.status === "cancelled") {
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    };

    void poll();

    if (status !== "completed") {
      pollingRef.current = window.setInterval(() => {
        void poll();
      }, 1800);
    }

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [kitId, router, status]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % rotatingMessages.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  const stopGeneration = async (destination: "form" | "home") => {
    setIsStopping(true);

    try {
      await fetch(`/api/kit/${kitId}/cancel`, {
        method: "POST",
      });
    } finally {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }

      router.replace(destination === "form" ? "/onboarding?edit=1" : "/?stay=1");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 35%), #0f0f1a",
        color: "#e2e8f0",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(19,19,31,0.9)",
          boxShadow: "0 24px 80px rgba(15,23,42,0.45)",
          padding: 32,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 10 }}>
          PREPWISE BY ORVION LABS
        </div>
        <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, color: "#f8fafc" }}>{currentCopy.title}</h1>
        <p style={{ margin: "14px 0 24px", fontSize: 15, lineHeight: 1.7, color: "#94a3b8" }}>{currentCopy.detail}</p>

        <div
          style={{
            marginBottom: 20,
            borderRadius: 16,
            border: "1px solid rgba(99,102,241,0.22)",
            background: "linear-gradient(90deg, rgba(99,102,241,0.14), rgba(168,85,247,0.1))",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7 }}>{rotatingMessages[messageIndex]}</div>
          <div
            style={{
              marginTop: 12,
              height: 6,
              borderRadius: 999,
              overflow: "hidden",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: status === "pending" ? "20%" : status === "analyzing_resume" ? "42%" : status === "generating_sections" ? "68%" : status === "generating_questions" ? "88%" : "100%",
                height: "100%",
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
                borderRadius: 999,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Resume</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>{initialFileName}</div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {(["analyzing_resume", "generating_sections", "generating_questions", "completed"] as PrepKitStatus[]).map(
            (stepStatus, index) => {
              const activeOrder = ["pending", "analyzing_resume", "generating_sections", "generating_questions", "completed", "failed"];
              const currentIndex = activeOrder.indexOf(status);
              const stepIndex = activeOrder.indexOf(stepStatus);
              const isActive = currentIndex >= stepIndex && status !== "failed";

              return (
                <div
                  key={stepStatus}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: isActive ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "rgba(99,102,241,0.24)" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: isActive ? "#6366f1" : "rgba(255,255,255,0.08)",
                      color: isActive ? "#fff" : "#64748b",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: 14, color: isActive ? "#e2e8f0" : "#64748b" }}>
                    {statusCopy[stepStatus].title}
                  </div>
                </div>
              );
            },
          )}
        </div>

        {status === "failed" ? (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.24)",
              background: "rgba(239,68,68,0.12)",
              padding: "14px 16px",
              color: "#fecaca",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {errorMessage || "The prep kit could not be generated."}
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => void stopGeneration("form")}
            disabled={isStopping}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#cbd5e1",
              fontSize: 13,
              cursor: isStopping ? "wait" : "pointer",
            }}
          >
            Back to form
          </button>
          <button
            type="button"
            onClick={() => void stopGeneration("home")}
            disabled={isStopping}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 13,
              cursor: isStopping ? "wait" : "pointer",
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
