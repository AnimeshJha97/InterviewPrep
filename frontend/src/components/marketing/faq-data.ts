import { BRAND } from "@/data/brand";

export interface MarketingFaqItem {
  question: string;
  answer: string;
}

export const marketingFaqItems: MarketingFaqItem[] = [
  {
    question: `What is ${BRAND.productName}?`,
    answer:
      `${BRAND.productName} is a resume-aware interview preparation workspace by ${BRAND.companyName}. It analyzes your background, target role, and preparation timeline to generate a structured interview prep kit built around your actual experience.`,
  },
  {
    question: "How does it work?",
    answer:
      `You sign in, upload your resume, add your target role and interview context, and ${BRAND.productName} generates section-wise preparation areas, role-specific questions, guided answer frameworks, and progress tracking inside one dashboard.`,
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. Free users can create a limited preview kit with a capped number of questions and section insights. Paid tiers unlock a larger question set, deeper answer guidance, and advanced preparation features.",
  },
  {
    question: "Are the questions generic?",
    answer:
      `No. ${BRAND.productName} is designed to generate questions based on your resume signals, experience level, target role, and optional job description so your practice feels aligned with the interviews you are actually preparing for.`,
  },
  {
    question: "Can I change my target role later?",
    answer:
      "Yes. You can update your profile and regenerate your preparation context. Free-tier users may have a limited number of retarget attempts, while paid users can revise their target role with more flexibility.",
  },
  {
    question: "How is my resume data handled?",
    answer:
      `Your resume is used to analyze skills, projects, seniority, and role fit so ${BRAND.productName} can create a personalized kit. For details on storage and data handling, please review the Privacy Policy.`,
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      `Yes. Subscription and payment handling will follow the active billing terms shown at checkout. If you need help with billing or cancellation, you can contact ${BRAND.productName} support directly.`,
  },
];
