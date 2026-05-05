import type { PrepDataset } from "@/components/interview-prep/types";
import type { GeneratedSection } from "@/types/prep-kit";

export function buildDashboardPrepData(sections: GeneratedSection[]): PrepDataset {
  return {
    groups: sections.map((section) => ({
      id: section.id,
      title: section.title,
      icon: section.icon,
      color: section.color,
      textColor: section.textColor,
      estimatedHours: section.estimatedHours,
      description: section.description,
      priorityScore: section.priorityScore,
      questions: section.questions.map((question) => ({
        id: question.id,
        difficulty: question.difficulty,
        question: question.question,
        answer: question.idealAnswer,
        type: question.type,
        tags: question.tags,
        estimatedMinutes: question.estimatedMinutes,
        whyAsked: question.whyAsked,
        beginnerAnswer: question.beginnerAnswer,
        seniorAnswer: question.seniorAnswer,
        followUpQuestions: question.followUpQuestions,
        resumeConnection: question.resumeConnection,
        commonMistakes: question.commonMistakes,
        isCompleted: question.isCompleted,
        userNotes: question.userNotes,
      })),
    })),
  };
}
