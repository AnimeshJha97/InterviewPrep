import { z } from "zod";

export const interviewTypeOptions = [
  "role-specific",
  "frontend",
  "backend",
  "full-stack",
  "system-design",
  "product-company",
  "startup",
  "design",
  "data-analytics",
  "product-management",
  "sales-marketing",
  "finance-accounting",
  "operations",
  "hr-recruiting",
  "leadership-management",
  "behavioral",
] as const;

export const interviewTypeLabels: Record<(typeof interviewTypeOptions)[number], string> = {
  "role-specific": "Role-specific interview",
  frontend: "Frontend engineering",
  backend: "Backend engineering",
  "full-stack": "Full-stack engineering",
  "system-design": "System design",
  "product-company": "Product company interviews",
  startup: "Startup interviews",
  design: "Design / UX / Product design",
  "data-analytics": "Data / Analytics / BI",
  "product-management": "Product management",
  "sales-marketing": "Sales / Marketing / Growth",
  "finance-accounting": "Finance / Accounting",
  operations: "Operations / Program management",
  "hr-recruiting": "HR / Recruiting",
  "leadership-management": "Leadership / Management",
  behavioral: "Behavioral / HR round",
};

export const confidenceLevelOptions = ["beginner", "intermediate", "advanced"] as const;

export const timelineOptions = [7, 14, 30] as const;

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
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
