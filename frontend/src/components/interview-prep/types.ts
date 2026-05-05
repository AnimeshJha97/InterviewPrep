export type DifficultyKey = "easy" | "medium" | "hard";
export type QuestionType = "common" | "tricky";

export interface PrepQuestion {
  id: string;
  difficulty: DifficultyKey;
  question: string;
  answer: string;
  type?: QuestionType;
  tags?: string[];
  estimatedMinutes?: number;
  whyAsked?: string;
  beginnerAnswer?: string;
  seniorAnswer?: string;
  followUpQuestions?: string[];
  resumeConnection?: string;
  commonMistakes?: string[];
  isCompleted?: boolean;
  userNotes?: string;
}

export interface PrepGroup {
  id: string;
  title: string;
  icon: string;
  color: string;
  textColor: string;
  estimatedHours: number;
  description?: string;
  priorityScore?: number;
  questions: ReadonlyArray<PrepQuestion>;
}

export interface PrepDataset {
  groups: ReadonlyArray<PrepGroup>;
}
