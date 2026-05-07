import { prepData } from "@/data/interview-prep";
import type { PrepDataset, PrepGroup, PrepQuestion } from "@/components/interview-prep/types";
import type {
  CandidateProfile,
  GeneratedPrepKitPayload,
  GeneratedQuestion,
  GeneratedSection,
  OnboardingProfile,
} from "@/types/prep-kit";

const sectionKeywordMap: Record<string, string[]> = {
  javascript: ["javascript", "es6", "async", "promise", "closure", "event loop", "frontend"],
  typescript: ["typescript", "typing", "interfaces", "generics", "strict", "tsconfig"],
  react: ["react", "hooks", "redux", "spa", "component", "frontend", "ui"],
  nodejs: ["node", "express", "api", "backend", "microservice", "rest", "auth"],
  databases: ["mysql", "mongo", "mongodb", "database", "sql", "index", "query", "schema"],
  systemdesign: ["architecture", "scale", "distributed", "system design", "tenant", "queue", "cache"],
  dsa: ["algorithm", "data structure", "dsa", "leetcode", "problem solving"],
  leadership: ["lead", "mentor", "stakeholder", "delivery", "ownership", "architect", "manager"],
  behavioral: ["collaboration", "conflict", "deadline", "team", "communication", "behavioral"],
  nextjs: ["next.js", "nextjs", "ssr", "ssg", "server components"],
  reactnative: ["react native", "mobile", "ios", "android", "offline", "expo"],
};

const interviewTypeBoosts: Record<string, string[]> = {
  frontend: ["javascript", "typescript", "react", "nextjs", "behavioral"],
  backend: ["nodejs", "databases", "systemdesign", "leadership"],
  "full-stack": ["javascript", "react", "nodejs", "databases", "systemdesign", "leadership"],
  "system-design": ["systemdesign", "databases", "nodejs", "leadership"],
  "product-company": ["dsa", "javascript", "react", "systemdesign", "behavioral"],
  startup: ["react", "nodejs", "systemdesign", "leadership", "behavioral"],
};

const genericCommonMistakes: Record<string, string[]> = {
  javascript: ["Giving a definition without walking through runtime behavior.", "Missing edge cases around async timing or binding."],
  typescript: ["Treating TypeScript as just syntax instead of a design tool.", "Skipping tradeoffs between safety and developer velocity."],
  react: ["Describing hooks mechanically without tying them to rendering behavior.", "Ignoring performance and stale state risks."],
  nodejs: ["Answering only at code level and not covering reliability or observability.", "Skipping idempotency, retries, and error boundaries."],
  databases: ["Talking only about schema and not about query shape or indexing.", "Missing tradeoffs between consistency, flexibility, and scale."],
  systemdesign: ["Jumping to tools before clarifying constraints.", "Ignoring failure modes, monitoring, and rollout strategy."],
  dsa: ["Optimizing before stating the brute-force baseline.", "Skipping complexity analysis and edge cases."],
  leadership: ["Giving vague stories without ownership, tradeoffs, and outcome.", "Focusing on activity instead of measurable impact."],
  behavioral: ["Telling generic stories without structure.", "Skipping what you learned or changed afterward."],
  nextjs: ["Mixing client and server concerns in one explanation.", "Ignoring caching and rendering tradeoffs."],
  reactnative: ["Talking only about UI and not device/network realities.", "Skipping offline, app lifecycle, and deployment concerns."],
};

const questionBank = prepData as unknown as PrepDataset;

function normalizeText(value: string) {
  return value.toLowerCase();
}

function countMatches(source: string, keywords: string[]) {
  return keywords.reduce((score, keyword) => score + (source.includes(keyword) ? 1 : 0), 0);
}

function buildCorpus(resumeText: string, onboarding: OnboardingProfile) {
  return normalizeText(
    [
      resumeText,
      onboarding.currentRole,
      onboarding.targetRole,
      onboarding.targetCompany,
      onboarding.jobDescription,
      onboarding.interviewType,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

function inferCandidateLevel(onboarding: OnboardingProfile, resumeText: string): CandidateProfile["candidateLevel"] {
  const years = onboarding.yearsOfExperience ?? 0;
  const corpus = normalizeText(`${onboarding.currentRole ?? ""}\n${resumeText}`);

  if (years >= 7 || /\b(senior|lead|architect|principal|staff)\b/.test(corpus)) {
    return "senior";
  }

  if (years >= 3) {
    return "mid";
  }

  return "junior";
}

function inferInterviewRounds(onboarding: OnboardingProfile, level: CandidateProfile["candidateLevel"]) {
  const rounds = ["Resume deep dive", "Technical core round", "Behavioral round"];

  if (onboarding.interviewType !== "startup") {
    rounds.splice(1, 0, "Coding / problem solving");
  }

  if (level !== "junior") {
    rounds.splice(rounds.length - 1, 0, "System design / architecture");
  }

  if (level === "senior") {
    rounds.splice(rounds.length - 1, 0, "Leadership / stakeholder round");
  }

  return rounds;
}

function buildQuestionTags(section: PrepGroup, question: PrepQuestion) {
  const baseTags = new Set<string>(question.tags ?? []);
  baseTags.add(section.id);

  const normalizedQuestion = normalizeText(question.question);

  if (normalizedQuestion.includes("performance")) baseTags.add("performance");
  if (normalizedQuestion.includes("design")) baseTags.add("design");
  if (normalizedQuestion.includes("async")) baseTags.add("async");
  if (normalizedQuestion.includes("database") || normalizedQuestion.includes("sql")) baseTags.add("data");
  if (normalizedQuestion.includes("lead")) baseTags.add("leadership");

  return Array.from(baseTags);
}

function difficultyMinutes(difficulty: GeneratedQuestion["difficulty"]) {
  if (difficulty === "hard") return 18;
  if (difficulty === "medium") return 12;
  return 8;
}

function summarizeForBeginner(answer: string) {
  const blocks = answer
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.slice(0, 2).join("\n\n");
}

function summarizeForSenior(answer: string, sectionTitle: string) {
  return `${answer}\n\nINTERVIEW EDGE:\nClose by tying the concept back to a real ${sectionTitle} production decision, tradeoff, or incident from your work.`;
}

function buildFollowUps(section: PrepGroup, question: PrepQuestion) {
  const sectionLabel = section.title;

  return [
    `What tradeoffs would change your answer in a high-scale ${sectionLabel} scenario?`,
    `How have you applied this concept in a real production project?`,
    `What is the most common mistake candidates make when answering this?`,
  ];
}

function buildResumeConnection(section: PrepGroup, matchedKeywords: string[], onboarding: OnboardingProfile) {
  const focus = matchedKeywords.slice(0, 3).join(", ");

  if (focus) {
    return `This section maps well to your background because your resume or target context mentions ${focus}. Use that to ground your answer in real project decisions.`;
  }

  if (onboarding.targetRole) {
    return `This section matters because it is a common evaluation area for ${onboarding.targetRole} interviews, even if your resume signals are lighter here.`;
  }

  return `This section is included to make sure your prep stays balanced across both resume strengths and likely interview gaps.`;
}

function buildWhyAsked(section: PrepGroup, question: PrepQuestion, level: CandidateProfile["candidateLevel"]) {
  const difficultyLabel = question.difficulty === "hard" ? "deep reasoning" : "working depth";

  return `Interviewers use this ${section.title} question to test ${difficultyLabel}, clarity under follow-up, and whether you can connect fundamentals to production decisions expected from a ${level}-level candidate.`;
}

function scoreSections(corpus: string, onboarding: OnboardingProfile) {
  const boostIds = onboarding.interviewType ? interviewTypeBoosts[onboarding.interviewType] ?? [] : [];

  return questionBank.groups
    .map((group) => {
      const keywords = sectionKeywordMap[group.id] ?? [];
      const matchedKeywords = keywords.filter((keyword) => corpus.includes(keyword));
      const keywordScore = countMatches(corpus, keywords);
      const questionBoost = group.questions.reduce(
        (sum, question) => sum + (corpus.includes(normalizeText(question.question)) ? 1 : 0),
        0,
      );
      const boostScore = boostIds.includes(group.id) ? 3 : 0;

      return {
        group,
        matchedKeywords,
        score: keywordScore + questionBoost + boostScore,
      };
    })
    .sort((left, right) => right.score - left.score || right.group.questions.length - left.group.questions.length);
}

function buildCandidateProfile(
  resumeText: string,
  onboarding: OnboardingProfile,
  scoredSections: ReturnType<typeof scoreSections>,
): CandidateProfile {
  const level = inferCandidateLevel(onboarding, resumeText);
  const strongAreas = scoredSections.filter((item) => item.score > 0).slice(0, 4).map((item) => item.group.title);
  const weakAreas = scoredSections
    .filter((item) => item.score === 0)
    .slice(0, 3)
    .map((item) => item.group.title);
  const priorityTopics = scoredSections.slice(0, 6).map((item) => item.group.title);
  const extractedSkills = scoredSections
    .filter((item) => item.score > 0)
    .slice(0, 8)
    .map((item) => item.group.title);
  const extractedProjects =
    onboarding.targetCompany && onboarding.targetRole
      ? [`Targeting ${onboarding.targetRole} interviews with ${onboarding.targetCompany} context`]
      : [onboarding.targetRole || onboarding.currentRole || "Primary resume projects"];

  return {
    candidateLevel: level,
    resumeCurrentRole: onboarding.currentRole || onboarding.targetRole || "Resume-inferred role unavailable",
    targetRole: onboarding.targetRole || onboarding.currentRole || "Target interview role",
    strongAreas,
    weakAreas,
    likelyInterviewRounds: inferInterviewRounds(onboarding, level),
    priorityTopics,
    extractedSkills,
    extractedProjects,
    experienceSummary:
      onboarding.currentRole && onboarding.targetRole
        ? `${onboarding.currentRole} preparing for ${onboarding.targetRole} interviews with emphasis on practical, production-facing examples.`
        : "Candidate profile inferred from resume and onboarding data.",
    yearsOfExperience: onboarding.yearsOfExperience ?? 0,
  };
}

function questionQuotaByTimeline(onboarding: OnboardingProfile) {
  if (onboarding.timelineDays === 30) return 6;
  if (onboarding.timelineDays === 7) return 4;
  return 5;
}

function sectionQuotaByTimeline(onboarding: OnboardingProfile) {
  if (onboarding.timelineDays === 30) return 10;
  if (onboarding.timelineDays === 7) return 6;
  return 8;
}

function sortQuestionsForCandidate(
  questions: ReadonlyArray<PrepQuestion>,
  confidenceLevel: OnboardingProfile["confidenceLevel"],
) {
  const ranked = [...questions];

  ranked.sort((left, right) => {
    const weight = (difficulty: PrepQuestion["difficulty"]) => {
      if (confidenceLevel === "advanced") {
        return difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;
      }

      if (confidenceLevel === "beginner") {
        return difficulty === "medium" ? 3 : difficulty === "easy" ? 2 : 1;
      }

      return difficulty === "medium" ? 3 : difficulty === "hard" ? 2 : 1;
    };

    return weight(right.difficulty) - weight(left.difficulty);
  });

  return ranked;
}

function buildGeneratedQuestion(
  section: PrepGroup,
  question: PrepQuestion,
  level: CandidateProfile["candidateLevel"],
  matchedKeywords: string[],
  onboarding: OnboardingProfile,
): GeneratedQuestion {
  return {
    id: question.id,
    question: question.question,
    difficulty: question.difficulty,
    type: question.type ?? "common",
    tags: buildQuestionTags(section, question),
    estimatedMinutes: difficultyMinutes(question.difficulty),
    whyAsked: buildWhyAsked(section, question, level),
    idealAnswer: question.answer,
    beginnerAnswer: summarizeForBeginner(question.answer),
    seniorAnswer: summarizeForSenior(question.answer, section.title),
    followUpQuestions: buildFollowUps(section, question),
    resumeConnection: buildResumeConnection(section, matchedKeywords, onboarding),
    commonMistakes: genericCommonMistakes[section.id] ?? [
      "Giving a textbook answer without connecting it to production tradeoffs.",
      "Skipping edge cases, failure modes, or team-level impact.",
    ],
    isCompleted: false,
    userNotes: "",
  };
}

function buildGeneratedSection(
  group: PrepGroup,
  matchedKeywords: string[],
  score: number,
  candidateProfile: CandidateProfile,
  onboarding: OnboardingProfile,
): GeneratedSection {
  const quota = questionQuotaByTimeline(onboarding);
  const selectedQuestions = sortQuestionsForCandidate(group.questions, onboarding.confidenceLevel).slice(0, quota);

  return {
    id: group.id,
    title: group.title,
    icon: group.icon,
    color: group.color,
    textColor: group.textColor,
    estimatedHours: Math.max(1, Math.min(group.estimatedHours, quota * 0.75)),
    description:
      matchedKeywords.length > 0
        ? `Prioritized because your resume or target role signals strength in ${matchedKeywords.slice(0, 3).join(", ")}.`
        : `Included to strengthen an interview area that is likely to come up for your target path.`,
    priorityScore: Math.max(score, matchedKeywords.length + 1),
    questions: selectedQuestions.map((question) =>
      buildGeneratedQuestion(group, question, candidateProfile.candidateLevel, matchedKeywords, onboarding),
    ),
  };
}

export function generatePrepKitFromResumeFallback({
  resumeText,
  onboarding,
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
}): GeneratedPrepKitPayload {
  const corpus = buildCorpus(resumeText, onboarding);
  const scoredSections = scoreSections(corpus, onboarding);
  const candidateProfile = buildCandidateProfile(resumeText, onboarding, scoredSections);
  const sectionQuota = sectionQuotaByTimeline(onboarding);

  const selectedSections = scoredSections
    .filter((item, index) => item.score > 0 || index < sectionQuota)
    .slice(0, sectionQuota)
    .map((item) => buildGeneratedSection(item.group, item.matchedKeywords, item.score, candidateProfile, onboarding));

  return {
    candidateProfile,
    sections: selectedSections,
  };
}
