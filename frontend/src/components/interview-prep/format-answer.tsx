import { repairText } from "./repair-text";

function isExplicitCodeLine(line: string): boolean {
  return line.startsWith(">>");
}

function stripExplicitCodePrefix(line: string): string {
  return line.startsWith(">>") ? line.slice(2).trim() : line;
}

function isBaseCodeLine(line: string): boolean {
  return /^(const|let|var|function|class|if|else|for|while|return|type|interface|async|await|import|export|fetch|\{|\}|\[|\]|\/\/|\/\*|\*|db\.|app\.|router\.|cron\.)/.test(line);
}

function isCodeContinuation(line: string): boolean {
  // Lines that are code continuations like }, );, catch, finally, else if
  return /^(},?\s*\)|catch|finally|else if|else\s*\{)/.test(line);
}

function isObjectProperty(line: string): boolean {
  // Detect object property lines like name: 'Animesh', or age: 30,
  return /^[\w$]+:\s*/.test(line);
}

function isMemberCall(line: string): boolean {
  // Detect member calls like console.log(...), obj.method(...), etc.
  return /^[\w$]+\.[\w$]+\s*\(/.test(line);
}

function isCodeLine(line: string): boolean {
  // Explicit code marker takes precedence
  if (isExplicitCodeLine(line)) {
    return true;
  }

  // Base code patterns
  if (isBaseCodeLine(line)) {
    return true;
  }

  // Code continuations
  if (isCodeContinuation(line)) {
    return true;
  }

  // Object properties
  if (isObjectProperty(line)) {
    return true;
  }

  // Member calls
  if (isMemberCall(line)) {
    return true;
  }

  // Arrow functions and complex expressions
  if (line.includes("=>") || (line.includes("(") && line.includes(")") && line.includes("{"))) {
    return true;
  }

  return false;
}

export function formatAnswer(text: string) {
  const lines = repairText(text).split("\n");

  return lines.map((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      return <div key={index} style={{ height: 8 }} />;
    }

    if (/^[A-Z][A-Z\s&\/\-]+:$/.test(line)) {
      return (
        <div
          key={index}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1.5,
            color: "#a78bfa",
            marginTop: 16,
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          {line}
        </div>
      );
    }

    if (line.startsWith("//")) {
      return (
        <div
          key={index}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 12,
            color: "#6b7280",
            paddingLeft: 16,
            lineHeight: 1.7,
          }}
        >
          {rawLine}
        </div>
      );
    }

    if (/^[A-Z][A-Z\s0-9]+\s*\(/.test(line) && !line.includes("=>") && !line.includes("function")) {
      return (
        <div
          key={index}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontWeight: 600,
            fontSize: 12,
            color: "#93c5fd",
            marginTop: 10,
            marginBottom: 2,
          }}
        >
          {line}
        </div>
      );
    }

    if (isCodeLine(line)) {
      const displayLine = stripExplicitCodePrefix(rawLine).trim();
      return (
        <div
          key={index}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 12,
            color: "#e2e8f0",
            backgroundColor: "rgba(0,0,0,0.3)",
            padding: "1px 8px",
            borderLeft: "2px solid rgba(99,102,241,0.5)",
            marginBottom: 1,
            lineHeight: 1.8,
            whiteSpace: "pre",
          }}
        >
          {displayLine}
        </div>
      );
    }

    if (line.startsWith("•")) {
      return (
        <div
          key={index}
          style={{
            fontSize: 13,
            color: "#d1d5db",
            paddingLeft: 16,
            lineHeight: 1.7,
            display: "flex",
            gap: 8,
          }}
        >
          <span style={{ color: "#6366f1", flexShrink: 0 }}>•</span>
          <span>{line.slice(1).trim()}</span>
        </div>
      );
    }

    return (
      <div key={index} style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.7 }}>
        {rawLine}
      </div>
    );
  });
}
