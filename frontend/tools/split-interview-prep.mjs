import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = "D:\\Projects\\InterviewPrep\\frontend";
const sourcePath = path.join(root, "src", "components", "interview_prep.jsx");
const dataDir = path.join(root, "src", "data", "interview-prep");

const groupConstNames = {
  javascript: "javascriptGroup",
  typescript: "typescriptGroup",
  react: "reactGroup",
  nodejs: "nodejsGroup",
  databases: "databasesGroup",
  systemdesign: "systemDesignGroup",
  dsa: "dsaGroup",
  leadership: "leadershipGroup",
  behavioral: "behavioralGroup",
  nextjs: "nextJsGroup",
  reactnative: "reactNativeGroup",
};

const mojibakePairs = [
  ["â€¢", "•"],
  ["â€”", "—"],
  ["â†’", "→"],
  ["âœ“", "✓"],
  ["â—‹", "○"],
  ["â–¼", "▼"],
  ["ðŸ”", "🔍"],
  ["âš¡", "⚡"],
  ["â¬¡", "⬡"],
  ["â˜…", "★"],
  ["âˆ‘", "∑"],
  ["ðŸ—„", "🗄"],
  ["âš™", "⚙"],
  ["ðŸ“±", "📱"],
  ["Â·", "·"],
  ["Â²", "²"],
  ["âœ“", "✓"],
  ["âœ“", "✓"],
  ["â†", "←"],
];

function repairText(value) {
  let next = value;
  for (const [from, to] of mojibakePairs) {
    next = next.split(from).join(to);
  }
  return next;
}

function deepRepair(value) {
  if (typeof value === "string") {
    return repairText(value);
  }
  if (Array.isArray(value)) {
    return value.map(deepRepair);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, deepRepair(inner)]));
  }
  return value;
}

function extractObjectLiteral(fileContents, startMarker, endMarker) {
  const start = fileContents.indexOf(startMarker);
  const end = fileContents.indexOf(endMarker);

  if (start === -1 || end === -1) {
    throw new Error(`Could not locate block between "${startMarker}" and "${endMarker}".`);
  }

  return fileContents.slice(start + startMarker.length, end).trim();
}

function evaluateLiteral(literal) {
  const normalized = literal.replace(/;\s*$/, "");
  return vm.runInNewContext(`(${normalized})`, {});
}

function serializeExport(constName, value) {
  return `export const ${constName} = ${JSON.stringify(value, null, 2)};\n`;
}

const fileContents = await readFile(sourcePath, "utf8");

const prepDataLiteral = extractObjectLiteral(
  fileContents,
  "const prepData = ",
  "\n\nconst difficultyConfig =",
);
const difficultyLiteral = extractObjectLiteral(
  fileContents,
  "const difficultyConfig = ",
  "\n\nfunction formatAnswer(",
);

const prepData = deepRepair(evaluateLiteral(prepDataLiteral));
const difficultyConfig = deepRepair(evaluateLiteral(difficultyLiteral));

await mkdir(dataDir, { recursive: true });

for (const group of prepData.groups) {
  const constName = groupConstNames[group.id];
  if (!constName) {
    throw new Error(`Missing constant mapping for group id "${group.id}".`);
  }
  const filePath = path.join(dataDir, `${group.id}.ts`);
  await writeFile(filePath, serializeExport(constName, group), "utf8");
}

const indexImports = prepData.groups
  .map((group) => `import { ${groupConstNames[group.id]} } from "./${group.id}";`)
  .join("\n");

const indexContent = `${indexImports}

export const prepData = {
  groups: [
${prepData.groups.map((group) => `    ${groupConstNames[group.id]}`).join(",\n")}
  ]
} as const;
`;

await writeFile(path.join(dataDir, "index.ts"), indexContent, "utf8");

const difficultyContent = `export const difficultyConfig = ${JSON.stringify(difficultyConfig, null, 2)} as const;\n`;
await writeFile(path.join(dataDir, "difficulty-config.ts"), difficultyContent, "utf8");

console.log("Split interview prep data generated successfully.");
