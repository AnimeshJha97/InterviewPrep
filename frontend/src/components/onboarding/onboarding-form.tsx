"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  confidenceLevelOptions,
  interviewTypeOptions,
  timelineOptions,
  type OnboardingInput,
} from "@/lib/validators";

interface OnboardingFormProps {
  initialValues?: Partial<OnboardingInput>;
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#e2e8f0",
  fontSize: 14,
  outline: "none",
};

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [form, setForm] = useState<OnboardingInput>({
    fullName: initialValues?.fullName ?? "",
    currentRole: initialValues?.currentRole ?? "",
    targetRole: initialValues?.targetRole ?? "",
    yearsOfExperience: initialValues?.yearsOfExperience ?? 0,
    interviewType: initialValues?.interviewType ?? "full-stack",
    targetCompany: initialValues?.targetCompany ?? "",
    jobDescription: initialValues?.jobDescription ?? "",
    confidenceLevel: initialValues?.confidenceLevel ?? "intermediate",
    timelineDays: initialValues?.timelineDays ?? 14,
  });

  const updateField = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (!resumeFile) {
        setError("Resume upload is required for the MVP flow.");
        return;
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Failed to save onboarding details.");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("resume", resumeFile);

      const uploadResponse = await fetch("/api/resume/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Profile saved, but resume upload failed.");
        return;
      }

      const uploadPayload = (await uploadResponse.json()) as { prepKitId?: string };

      if (!uploadPayload.prepKitId) {
        setError("Resume uploaded, but prep kit creation did not return an id.");
        return;
      }

      router.push(`/generating/${uploadPayload.prepKitId}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#cbd5e1" }}>Full name</label>
        <input
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          placeholder="e.g. Animesh Jha"
          style={fieldStyle}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#cbd5e1" }}>Current role</label>
        <input
          value={form.currentRole}
          onChange={(event) => updateField("currentRole", event.target.value)}
          placeholder="e.g. Senior Frontend Developer"
          style={fieldStyle}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#cbd5e1" }}>Target role</label>
        <input
          value={form.targetRole}
          onChange={(event) => updateField("targetRole", event.target.value)}
          placeholder="e.g. Senior Full Stack Developer"
          style={fieldStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#cbd5e1" }}>Years of experience</label>
          <input
            type="number"
            min={0}
            max={40}
            value={form.yearsOfExperience}
            onChange={(event) => updateField("yearsOfExperience", Number(event.target.value))}
            style={fieldStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#cbd5e1" }}>Interview type</label>
          <select
            value={form.interviewType}
            onChange={(event) => updateField("interviewType", event.target.value as OnboardingInput["interviewType"])}
            style={fieldStyle}
          >
            {interviewTypeOptions.map((option) => (
              <option key={option} value={option} style={{ background: "#13131f" }}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#cbd5e1" }}>Target company (optional)</label>
        <input
          value={form.targetCompany ?? ""}
          onChange={(event) => updateField("targetCompany", event.target.value)}
          placeholder="e.g. Razorpay, Google, Flipkart"
          style={fieldStyle}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#cbd5e1" }}>Job description (optional)</label>
        <textarea
          value={form.jobDescription ?? ""}
          onChange={(event) => updateField("jobDescription", event.target.value)}
          placeholder="Paste a target job description to personalize the generated prep kit further."
          style={{ ...fieldStyle, minHeight: 140, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#cbd5e1" }}>Confidence level</label>
          <select
            value={form.confidenceLevel}
            onChange={(event) =>
              updateField("confidenceLevel", event.target.value as OnboardingInput["confidenceLevel"])
            }
            style={fieldStyle}
          >
            {confidenceLevelOptions.map((option) => (
              <option key={option} value={option} style={{ background: "#13131f" }}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#cbd5e1" }}>Prep timeline</label>
          <select
            value={String(form.timelineDays)}
            onChange={(event) => updateField("timelineDays", Number(event.target.value) as OnboardingInput["timelineDays"])}
            style={fieldStyle}
          >
            {timelineOptions.map((option) => (
              <option key={option} value={option} style={{ background: "#13131f" }}>
                {option} days
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#cbd5e1" }}>Resume upload (PDF or DOCX)</label>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
          style={{
            ...fieldStyle,
            padding: 10,
          }}
        />
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Max file size 5MB. We’ll extract the text and create a pending prep kit from it.
        </div>
      </div>

      {error ? (
        <div
          style={{
            borderRadius: 12,
            background: "rgba(239,68,68,0.14)",
            border: "1px solid rgba(239,68,68,0.24)",
            padding: "12px 14px",
            color: "#fecaca",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "14px 18px",
          borderRadius: 12,
          border: "1px solid rgba(99,102,241,0.22)",
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "#ffffff",
          cursor: isPending ? "wait" : "pointer",
          fontWeight: 700,
          fontSize: 14,
          opacity: isPending ? 0.8 : 1,
        }}
      >
        {isPending ? "Saving profile..." : "Save and continue"}
      </button>
    </form>
  );
}
