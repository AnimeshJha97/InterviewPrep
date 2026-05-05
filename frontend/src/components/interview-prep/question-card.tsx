import { useEffect, useRef, useState } from "react";

import { difficultyConfig } from "@/data/interview-prep/difficulty-config";

import { formatAnswer } from "./format-answer";
import { repairText } from "./repair-text";
import type { DifficultyKey, PrepQuestion } from "./types";

interface QuestionCardProps {
  index: number;
  question: PrepQuestion;
  isOpen: boolean;
  isDone: boolean;
  onToggleOpen: () => void;
  onToggleCompleted: () => void;
  onNoteChange: (value: string) => void;
  onCollapse: () => void;
}

export function QuestionCard({
  index,
  question,
  isOpen,
  isDone,
  onToggleOpen,
  onToggleCompleted,
  onNoteChange,
  onCollapse,
}: QuestionCardProps) {
  const [draftNote, setDraftNote] = useState(question.userNotes ?? "");
  const firstRenderRef = useRef(true);
  const diff = difficultyConfig[question.difficulty as DifficultyKey];
  const tags = (question as { tags?: string[] }).tags;

  useEffect(() => {
    setDraftNote(question.userNotes ?? "");
  }, [question.userNotes, question.id]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      onNoteChange(draftNote);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draftNote, onNoteChange]);

  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 10,
        border: `1px solid ${
          isOpen ? "rgba(99,102,241,0.4)" : isDone ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"
        }`,
        background: isOpen ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.02)",
        transition: "all 0.2s",
        overflow: "hidden",
      }}
    >
      <div
        onClick={onToggleOpen}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: isDone ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: isDone ? "#22c55e" : "#475569",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {isDone ? "✓" : index + 1}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: isDone ? "#94a3b8" : "#e2e8f0",
              lineHeight: 1.5,
              marginBottom: 6,
            }}
          >
            {repairText(question.question)}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 100,
                background: diff.bg,
                color: diff.color,
              }}
            >
              {diff.label}
            </span>
            {question.type === "tricky" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 100,
                  background: "rgba(168,85,247,0.15)",
                  color: "#a855f7",
                }}
              >
                ⚡ Tricky
              </span>
            )}
            {tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 100,
                  background: "rgba(255,255,255,0.05)",
                  color: "#64748b",
                }}
              >
                #{repairText(tag)}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            color: "#475569",
            fontSize: 14,
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </div>
      </div>

      {isOpen && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ padding: "16px 20px", maxHeight: 500, overflowY: "auto" }}>
            {question.whyAsked ? (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#818cf8", marginBottom: 8 }}>
                  WHY THIS IS ASKED
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>{repairText(question.whyAsked)}</div>
              </div>
            ) : null}

            {formatAnswer(question.answer)}

            {question.resumeConnection ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#22c55e", marginBottom: 8 }}>
                  RESUME CONNECTION
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>{repairText(question.resumeConnection)}</div>
              </div>
            ) : null}

            {question.followUpQuestions?.length ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#f59e0b", marginBottom: 8 }}>
                  FOLLOW-UP QUESTIONS
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", fontSize: 13, lineHeight: 1.8 }}>
                  {question.followUpQuestions.map((followUp) => (
                    <li key={followUp}>{repairText(followUp)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {question.commonMistakes?.length ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#f87171", marginBottom: 8 }}>
                  COMMON MISTAKES
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", fontSize: 13, lineHeight: 1.8 }}>
                  {question.commonMistakes.map((mistake) => (
                    <li key={mistake}>{repairText(mistake)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#38bdf8", marginBottom: 8 }}>
                YOUR NOTES
              </div>
              <textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="Write your own answer structure, examples, or weak spots here. Notes autosave."
                style={{
                  width: "100%",
                  minHeight: 110,
                  resize: "vertical",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#e2e8f0",
                  padding: "12px 14px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  outline: "none",
                }}
              />
              <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>Autosaves shortly after you stop typing.</div>
            </div>
          </div>
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              gap: 8,
            }}
          >
            <button
              onClick={onToggleCompleted}
              style={{
                padding: "7px 16px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: isDone ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)",
                color: isDone ? "#22c55e" : "#a78bfa",
                transition: "all 0.15s",
              }}
            >
              {isDone ? "✓ Completed" : "○ Mark Complete"}
            </button>
            <button
              onClick={onCollapse}
              style={{
                padding: "7px 16px",
                borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontSize: 12,
                background: "transparent",
                color: "#64748b",
              }}
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
