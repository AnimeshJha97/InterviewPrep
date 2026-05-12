import type { DifficultyKey, PrepGroup, QuestionType } from "@/components/interview-prep/types";

export type InterviewType =
  | "role-specific"
  | "frontend"
  | "backend"
  | "full-stack"
  | "system-design"
  | "product-company"
  | "startup"
  | "design"
  | "data-analytics"
  | "product-management"
  | "sales-marketing"
  | "finance-accounting"
  | "operations"
  | "hr-recruiting"
  | "leadership-management"
  | "behavioral";

export type ConfidenceLevel = "beginner" | "intermediate" | "advanced";
export type UserPlan = "free" | "paid";
export type PrepKitStatus =
  | "pending"
  | "analyzing_resume"
  | "generating_sections"
  | "generating_questions"
  | "completed"
  | "failed"
  | "cancelled";

export interface OnboardingProfile {
  fullName?: string;
  currentRole?: string;
  targetRole?: string;
  yearsOfExperience?: number;
  interviewType?: InterviewType;
  targetCompany?: string;
  jobDescription?: string;
  confidenceLevel?: ConfidenceLevel;
  timelineDays?: 7 | 14 | 30;
}

export interface CandidateProfile {
  candidateLevel: "junior" | "mid" | "senior";
  resumeCurrentRole: string;
  targetRole: string;
  strongAreas: string[];
  weakAreas: string[];
  likelyInterviewRounds: string[];
  priorityTopics: string[];
  extractedSkills: string[];
  extractedProjects: string[];
  experienceSummary: string;
  yearsOfExperience: number;
}

export interface ConsistencyIssue {
  code:
    | "current_role_mismatch"
    | "target_role_low_alignment"
    | "experience_mismatch"
    | "interview_type_low_alignment"
    | "resume_low_signal";
  severity: "info" | "warning";
  title: string;
  detail: string;
  recommendation: string;
}

export interface ConsistencySummary {
  hasConflicts: boolean;
  issues: ConsistencyIssue[];
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  difficulty: DifficultyKey;
  type: QuestionType;
  tags: string[];
  estimatedMinutes: number;
  whyAsked: string;
  idealAnswer: string;
  beginnerAnswer: string;
  seniorAnswer: string;
  followUpQuestions: string[];
  resumeConnection: string;
  commonMistakes: string[];
  isCompleted: boolean;
  userNotes?: string;
}

export interface GeneratedSection extends Omit<PrepGroup, "questions"> {
  questions: GeneratedQuestion[];
}

export interface GeneratedPrepKitPayload {
  candidateProfile: CandidateProfile;
  sections: GeneratedSection[];
  generationMeta?: {
    provider: "gemini" | "groq";
    model: string;
    generatedFromResume: true;
    usedFallback?: boolean;
    plan: UserPlan;
    sectionCount: number;
    totalQuestions: number;
    consistencySummary?: ConsistencySummary;
  };
}

export interface PrepKitSummary {
  id: string;
  status: PrepKitStatus;
  resumeFileName: string;
  resumeUrl: string;
  errorMessage?: string;
  onboarding: OnboardingProfile;
  candidateProfile: Partial<CandidateProfile>;
  sections: GeneratedSection[];
  createdAt?: string;
  updatedAt?: string;
}
