import { z } from "zod";

export const interviewTypeOptions = [
  "frontend",
  "backend",
  "full-stack",
  "system-design",
  "product-company",
  "startup",
] as const;

export const confidenceLevelOptions = ["beginner", "intermediate", "advanced"] as const;

export const timelineOptions = [7, 14, 30] as const;

export const onboardingSchema = z.object({
  currentRole: z.string().trim().min(2, "Current role is required."),
  targetRole: z.string().trim().min(2, "Target role is required."),
  yearsOfExperience: z.coerce.number().min(0).max(40),
  interviewType: z.enum(interviewTypeOptions),
  targetCompany: z.string().trim().max(100).optional().or(z.literal("")),
  jobDescription: z.string().trim().max(6000).optional().or(z.literal("")),
  confidenceLevel: z.enum(confidenceLevelOptions),
  timelineDays: z.coerce.number().refine((value) => timelineOptions.includes(value as 7 | 14 | 30), {
    message: "Invalid timeline selected.",
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
