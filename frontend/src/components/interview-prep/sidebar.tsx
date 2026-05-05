import { repairText } from "./repair-text";
import type { PrepGroup } from "./types";

interface SidebarProps {
  activeGroup: string;
  groups: ReadonlyArray<PrepGroup>;
  completed: Record<string, boolean>;
  progress: number;
  totalDone: number;
  totalQuestions: number;
  profileName: string;
  profileRole: string;
  onSelectGroup: (groupId: string) => void;
}

function groupDone(group: PrepGroup, completed: Record<string, boolean>) {
  return group.questions.filter((question) => completed[question.id]).length;
}

export function Sidebar({
  activeGroup,
  groups,
  completed,
  progress,
  totalDone,
  totalQuestions,
  profileName,
  profileRole,
  onSelectGroup,
}: SidebarProps) {
  const stats = [
    {
      label: "Hard",
      value: groups.reduce(
        (sum, group) => sum + group.questions.filter((question) => question.difficulty === "hard").length,
        0,
      ),
      color: "#ef4444",
    },
    {
      label: "Medium",
      value: groups.reduce(
        (sum, group) => sum + group.questions.filter((question) => question.difficulty === "medium").length,
        0,
      ),
      color: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        width: 260,
        background: "#13131f",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: "#6366f1",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          INTERVIEW PREP
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{repairText(profileName)}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>{repairText(profileRole)}</div>

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 100,
            height: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #a78bfa)",
              borderRadius: 100,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 10, color: "#64748b" }}>
            {totalDone} / {totalQuestions} completed
          </span>
          <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>{progress}%</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {groups.map((group) => {
          const done = groupDone(group, completed);
          const active = activeGroup === group.id;

          return (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 2,
                cursor: "pointer",
                transition: "all 0.15s",
                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: active ? group.color : "rgba(255,255,255,0.06)",
                    color: active ? group.textColor : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  {repairText(group.icon)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#f8fafc" : "#94a3b8",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {repairText(group.title)}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>
                    {group.questions.length} Q · ~{group.estimatedHours}h
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: done === group.questions.length ? "#22c55e" : "#475569",
                    fontWeight: 600,
                  }}
                >
                  {done}/{group.questions.length}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 6,
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
