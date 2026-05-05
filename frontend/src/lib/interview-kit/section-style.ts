const sectionStyleMap: Record<
  string,
  {
    icon: string;
    color: string;
    textColor: string;
  }
> = {
  javascript: { icon: "JS", color: "#F7DF1E", textColor: "#1a1a1a" },
  typescript: { icon: "TS", color: "#3178C6", textColor: "#ffffff" },
  react: { icon: "RE", color: "#61DAFB", textColor: "#06283D" },
  "react.js": { icon: "RE", color: "#61DAFB", textColor: "#06283D" },
  nodejs: { icon: "ND", color: "#68A063", textColor: "#081c0d" },
  "node.js": { icon: "ND", color: "#68A063", textColor: "#081c0d" },
  backend: { icon: "BE", color: "#14b8a6", textColor: "#042f2e" },
  databases: { icon: "DB", color: "#f97316", textColor: "#431407" },
  database: { icon: "DB", color: "#f97316", textColor: "#431407" },
  "system-design": { icon: "SD", color: "#a855f7", textColor: "#ffffff" },
  systemdesign: { icon: "SD", color: "#a855f7", textColor: "#ffffff" },
  leadership: { icon: "LD", color: "#ec4899", textColor: "#ffffff" },
  behavioral: { icon: "BH", color: "#22c55e", textColor: "#052e16" },
  dsa: { icon: "DS", color: "#ef4444", textColor: "#ffffff" },
  algorithms: { icon: "DS", color: "#ef4444", textColor: "#ffffff" },
  nextjs: { icon: "NX", color: "#e2e8f0", textColor: "#0f172a" },
  "next.js": { icon: "NX", color: "#e2e8f0", textColor: "#0f172a" },
  reactnative: { icon: "RN", color: "#38bdf8", textColor: "#082f49" },
  "react-native": { icon: "RN", color: "#38bdf8", textColor: "#082f49" },
  mobile: { icon: "MB", color: "#38bdf8", textColor: "#082f49" },
  devops: { icon: "DV", color: "#f59e0b", textColor: "#451a03" },
  cloud: { icon: "CL", color: "#0ea5e9", textColor: "#082f49" },
  architecture: { icon: "AR", color: "#8b5cf6", textColor: "#ffffff" },
};

export function slugifySectionTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSectionStyle(title: string) {
  const slug = slugifySectionTitle(title);
  const match = sectionStyleMap[slug] ?? sectionStyleMap[title.trim().toLowerCase()];

  if (match) {
    return { id: slug, ...match };
  }

  const fallbackIcon = title
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "IP";

  return {
    id: slug || "custom-section",
    icon: fallbackIcon,
    color: "#94a3b8",
    textColor: "#0f172a",
  };
}
