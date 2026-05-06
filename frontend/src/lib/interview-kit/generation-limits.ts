import type { UserPlan } from "@/types/prep-kit";
import { getPlanGenerationLimits } from "@/lib/config/plan-limits";

export interface GenerationLimits {
  sectionCount: number;
  totalQuestions: number;
  maxQuestionsPerSection: number;
}

export function getGenerationLimits(plan: UserPlan): GenerationLimits {
  return getPlanGenerationLimits(plan);
}
