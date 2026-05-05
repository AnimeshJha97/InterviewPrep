import { repairText } from "./repair-text";
import type { PrepGroup } from "./types";

interface TopbarProps {
  group: PrepGroup | undefined;
  filter: string;
  search: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export function Topbar({
  group,
  filter,
  search,
  onSearchChange,
  onFilterChange,
}: TopbarProps) {
  return (
    <div
      style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "#13131f",
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              background: group?.color,
              color: group?.textColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
            }}
          >
            {repairText(group?.icon ?? "")}
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
            {repairText(group?.title ?? "")}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#475569",
              padding: "2px 8px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 100,
            }}
          >
            ~{group?.estimatedHours}h
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search questions..."
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "6px 12px 6px 32px",
              color: "#e2e8f0",
              fontSize: 12,
              outline: "none",
              width: 200,
            }}
          />
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: "#475569",
            }}
          >
            🔍
          </span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {["all", "medium", "hard"].map((value) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                transition: "all 0.15s",
                background:
                  filter === value
                    ? value === "all"
                      ? "#6366f1"
                      : value === "hard"
                        ? "#ef4444"
                        : "#f59e0b"
                    : "rgba(255,255,255,0.06)",
                color: filter === value ? "#fff" : "#64748b",
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
