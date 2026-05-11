"use client";

import { useMemo, useState } from "react";

import { QuestionList } from "./question-list";
import { repairText } from "./repair-text";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { PrepDataset } from "./types";

interface EmptyStateConfig {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

interface NoticeConfig {
  title: string;
  description: string;
  items?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

interface InterviewPrepScreenProps {
  data?: PrepDataset;
  profileName?: string;
  profileRole?: string;
  kitId?: string;
  questionLimit?: number;
  emptyState?: EmptyStateConfig;
  notice?: NoticeConfig;
}

export function InterviewPrepScreen({
  data,
  profileName = "Animesh Jha",
  profileRole = "Senior Full Stack Developer",
  kitId,
  questionLimit,
  emptyState,
  notice,
}: InterviewPrepScreenProps) {
  const safeData = useMemo<PrepDataset>(() => data ?? { groups: [] }, [data]);
  const initialCompleted = useMemo(
    () =>
      Object.fromEntries(
        safeData.groups.flatMap((group) =>
          group.questions.filter((question) => question.isCompleted).map((question) => [question.id, true]),
        ),
      ),
    [safeData],
  );
  const initialNotes = useMemo(
    () =>
      Object.fromEntries(
        safeData.groups.flatMap((group) => group.questions.map((question) => [question.id, question.userNotes ?? ""])),
      ),
    [safeData],
  );
  const [activeGroup, setActiveGroup] = useState("javascript");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>(initialCompleted);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const groups = safeData.groups;
  const visibleQuestionIds = useMemo(() => {
    if (!questionLimit) {
      return null;
    }

    return new Set(
      safeData.groups
        .flatMap((group) => group.questions.map((question) => question.id))
        .slice(0, questionLimit),
    );
  }, [questionLimit, safeData]);
  const defaultGroupId = groups[0]?.id ?? "javascript";
  const normalizedActiveGroup = groups.some((item) => item.id === activeGroup) ? activeGroup : defaultGroupId;
  const group = groups.find((item) => item.id === normalizedActiveGroup);
  const hasRealData = groups.length > 0;

  const filtered =
    group?.questions
      .map((question) => ({
        ...question,
        isCompleted: Boolean(completed[question.id]),
        userNotes: notes[question.id] ?? "",
      }))
      .filter((question) => {
        if (filter !== "all" && question.difficulty !== filter) {
          return false;
        }

        if (search && !repairText(question.question).toLowerCase().includes(search.toLowerCase())) {
          return false;
        }

        return true;
      }) ?? [];
  const visibleQuestions = visibleQuestionIds
    ? filtered.filter((question) => visibleQuestionIds.has(question.id))
    : filtered;
  const lockedCount = filtered.length - visibleQuestions.length;

  const persistCompleted = async (questionId: string, nextValue: boolean) => {
    setCompleted((prev) => {
      if (nextValue) {
        return { ...prev, [questionId]: true };
      }

      const next = { ...prev };
      delete next[questionId];
      return next;
    });

    if (!kitId) {
      return;
    }

    await fetch(`/api/kit/${kitId}/questions/${questionId}/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isCompleted: nextValue,
      }),
    }).catch(() => undefined);
  };

  const persistNote = async (questionId: string, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    if (!kitId) {
      return;
    }

    await fetch(`/api/kit/${kitId}/questions/${questionId}/notes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userNotes: value,
      }),
    }).catch(() => undefined);
  };

  const totalQ = groups.reduce((sum, item) => sum + item.questions.length, 0);
  const totalDone = Object.keys(completed).length;
  const progress = totalQ > 0 ? Math.round((totalDone / totalQ) * 100) : 0;

  if (!hasRealData) {
    const resolvedEmptyState = emptyState ?? {
      title: "No interview kit yet",
      description: "Upload a resume and save your profile to generate a personalized prep kit.",
      ctaLabel: "Go to profile",
      ctaHref: "/onboarding?edit=1",
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0f1a",
          color: "#e2e8f0",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(19,19,31,0.92)",
            padding: 32,
            boxShadow: "0 24px 80px rgba(2,6,23,0.42)",
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 10 }}>
            P3KIT
          </div>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, color: "#f8fafc" }}>{resolvedEmptyState.title}</h1>
          <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.8, color: "#94a3b8" }}>
            {resolvedEmptyState.description}
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={resolvedEmptyState.ctaHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 18px",
                borderRadius: 12,
                border: "1px solid rgba(99,102,241,0.24)",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {resolvedEmptyState.ctaLabel}
            </a>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 18px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "#cbd5e1",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0f0f1a",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <Sidebar
        activeGroup={normalizedActiveGroup}
        groups={groups}
        completed={completed}
        progress={progress}
        totalDone={totalDone}
        totalQuestions={totalQ}
        profileName={profileName}
        profileRole={profileRole}
        onSelectGroup={(groupId) => {
          setActiveGroup(groupId);
          setExpandedQ(null);
          setSearch("");
        }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar
          group={group}
          filter={filter}
          search={search}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {notice ? (
            <div
              style={{
                marginBottom: 16,
                borderRadius: 16,
                border: "1px solid rgba(245,158,11,0.24)",
                background: "rgba(245,158,11,0.1)",
                padding: "16px 18px",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>{notice.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "#fde68a" }}>{notice.description}</div>
              {notice.items && notice.items.length > 0 ? (
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {notice.items.map((item) => (
                    <div key={item} style={{ fontSize: 12, lineHeight: 1.6, color: "#fef3c7" }}>
                      • {item}
                    </div>
                  ))}
                </div>
              ) : null}
              {notice.ctaLabel && notice.ctaHref ? (
                <div style={{ marginTop: 14 }}>
                  <a
                    href={notice.ctaHref}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff7ed",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {notice.ctaLabel}
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
          <QuestionList
            questions={visibleQuestions}
            expandedQ={expandedQ}
            completed={completed}
            lockedCount={lockedCount}
            onToggleOpen={(questionId) => setExpandedQ(expandedQ === questionId ? null : questionId)}
            onToggleCompleted={(questionId) => persistCompleted(questionId, !completed[questionId])}
            onNoteChange={persistNote}
            onCollapse={() => setExpandedQ(null)}
          />
        </div>
      </div>
    </div>
  );
}
