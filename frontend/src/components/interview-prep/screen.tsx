"use client";

import { useMemo, useState } from "react";

import { prepData } from "@/data/interview-prep";

import { QuestionList } from "./question-list";
import { repairText } from "./repair-text";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { PrepDataset } from "./types";

interface InterviewPrepScreenProps {
  data?: PrepDataset;
  profileName?: string;
  profileRole?: string;
  kitId?: string;
  questionLimit?: number;
}

export function InterviewPrepScreen({
  data = prepData as unknown as PrepDataset,
  profileName = "Animesh Jha",
  profileRole = "Senior Full Stack Developer",
  kitId,
  questionLimit,
}: InterviewPrepScreenProps) {
  const initialCompleted = useMemo(
    () =>
      Object.fromEntries(
        data.groups.flatMap((group) =>
          group.questions.filter((question) => question.isCompleted).map((question) => [question.id, true]),
        ),
      ),
    [data],
  );
  const initialNotes = useMemo(
    () =>
      Object.fromEntries(
        data.groups.flatMap((group) => group.questions.map((question) => [question.id, question.userNotes ?? ""])),
      ),
    [data],
  );
  const [activeGroup, setActiveGroup] = useState("javascript");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>(initialCompleted);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const groups = data.groups;
  const visibleQuestionIds = useMemo(() => {
    if (!questionLimit) {
      return null;
    }

    return new Set(
      data.groups
        .flatMap((group) => group.questions.map((question) => question.id))
        .slice(0, questionLimit),
    );
  }, [data, questionLimit]);
  const defaultGroupId = groups[0]?.id ?? "javascript";
  const normalizedActiveGroup = groups.some((item) => item.id === activeGroup) ? activeGroup : defaultGroupId;
  const group = groups.find((item) => item.id === normalizedActiveGroup);

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
