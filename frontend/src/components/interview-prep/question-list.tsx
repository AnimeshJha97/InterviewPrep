import { QuestionCard } from "./question-card";
import type { PrepQuestion } from "./types";

interface QuestionListProps {
  questions: PrepQuestion[];
  expandedQ: string | null;
  completed: Record<string, boolean>;
  lockedCount?: number;
  onToggleOpen: (questionId: string) => void;
  onToggleCompleted: (questionId: string) => void;
  onNoteChange: (questionId: string, value: string) => void;
  onCollapse: () => void;
}

export function QuestionList({
  questions,
  expandedQ,
  completed,
  lockedCount = 0,
  onToggleOpen,
  onToggleCompleted,
  onNoteChange,
  onCollapse,
}: QuestionListProps) {
  if (questions.length === 0) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>No questions match your filter.</div>;
  }

  return (
    <>
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index}
          question={question}
          isOpen={expandedQ === question.id}
          isDone={Boolean(completed[question.id])}
          onToggleOpen={() => onToggleOpen(question.id)}
          onToggleCompleted={() => onToggleCompleted(question.id)}
          onNoteChange={(value) => onNoteChange(question.id, value)}
          onCollapse={onCollapse}
        />
      ))}
      {lockedCount > 0 ? (
        <div
          style={{
            marginTop: 14,
            borderRadius: 14,
            border: "1px solid rgba(99,102,241,0.2)",
            background: "linear-gradient(180deg, rgba(99,102,241,0.12), rgba(255,255,255,0.03))",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, color: "#818cf8", marginBottom: 8 }}>
            FREE PLAN PREVIEW
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f8fafc", marginBottom: 8 }}>
            {lockedCount} more personalized questions are ready in this kit.
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "#cbd5e1" }}>
            The free experience shows a sample slice of your generated dashboard. Paid access can later unlock the full
            question bank, deeper answer feedback, and multiple kits.
          </div>
        </div>
      ) : null}
    </>
  );
}
