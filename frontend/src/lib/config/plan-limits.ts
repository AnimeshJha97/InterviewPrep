import type { UserPlan } from "@/types/prep-kit";

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface PlanGenerationLimits {
  sectionCount: number;
  totalQuestions: number;
  maxQuestionsPerSection: number;
}

export function getPlanGenerationLimits(plan: UserPlan): PlanGenerationLimits {
  if (plan === "paid") {
    const totalQuestions = readNumber(process.env.PAID_PLAN_TOTAL_QUESTIONS, 40);
    const sectionCount = readNumber(process.env.PAID_PLAN_SECTION_COUNT, 8);
    const maxQuestionsPerSection = readNumber(process.env.PAID_PLAN_MAX_QUESTIONS_PER_SECTION, 5);

    return {
      sectionCount,
      totalQuestions,
      maxQuestionsPerSection,
    };
  }

  const totalQuestions = readNumber(process.env.FREE_PLAN_TOTAL_QUESTIONS, 10);
  const sectionCount = readNumber(process.env.FREE_PLAN_SECTION_COUNT, 5);
  const maxQuestionsPerSection = readNumber(process.env.FREE_PLAN_MAX_QUESTIONS_PER_SECTION, 2);

  return {
    sectionCount,
    totalQuestions,
    maxQuestionsPerSection,
  };
}

export function getQuestionVisibilityLimit(plan: UserPlan) {
  if (plan === "paid") {
    return readNumber(process.env.PAID_PLAN_VISIBLE_QUESTIONS, getPlanGenerationLimits(plan).totalQuestions);
  }

  return readNumber(process.env.FREE_PLAN_VISIBLE_QUESTIONS, getPlanGenerationLimits(plan).totalQuestions);
}

export function getFreePlanRetargetLimit() {
  return readNumber(process.env.FREE_PLAN_PROFILE_RETARGET_LIMIT, 1);
}
