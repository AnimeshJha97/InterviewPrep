import type { UserPlan } from "@/types/prep-kit";

export interface GenerationLimits {
  sectionCount: number;
  totalQuestions: number;
  maxQuestionsPerSection: number;
}

const limitsByPlan: Record<UserPlan, GenerationLimits> = {
  free: {
    sectionCount: 5,
    totalQuestions: 10,
    maxQuestionsPerSection: 2,
  },
  paid: {
    sectionCount: 8,
    totalQuestions: 40,
    maxQuestionsPerSection: 5,
  },
};

export function getGenerationLimits(plan: UserPlan): GenerationLimits {
  return limitsByPlan[plan] ?? limitsByPlan.free;
}
