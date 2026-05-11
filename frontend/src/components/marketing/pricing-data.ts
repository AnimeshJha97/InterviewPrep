import { BRAND } from "@/data/brand";

export interface MarketingPricingPlan {
  name: string;
  price: string;
  note?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
  disabled?: boolean;
}

export const marketingPricingPlans: MarketingPricingPlan[] = [
  {
    name: "Free Starter",
    price: "Rs0",
    note: "",
    description: `Preview how ${BRAND.productName} builds your resume-aware preparation kit.`,
    features: [
      "Google sign-in",
      "Resume upload",
      "AI kit generation",
      "Limited question preview",
      "Section-wise roadmap preview",
      "Basic progress tracking",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Full Prep Kit",
    price: "Rs299",
    note: "",
    description: "Unlock your complete personalized interview preparation workspace.",
    features: [
      "Full question access",
      "Resume-aware questions",
      "Guided answer frameworks",
      "Follow-up questions",
      "Common mistakes",
      "User notes",
      "Completion tracking",
    ],
    cta: "Unlock full kit",
    highlighted: true,
    badge: "Recommended",
  },
  {
    name: "Practice Plus",
    price: "Rs499",
    note: "",
    description: "Practice answers and get AI feedback to improve your interview responses.",
    features: [
      "Everything in Full Prep Kit",
      "AI answer review",
      "Improved answer suggestions",
      "Practice attempts",
      "Weak area summary",
      "Target role retuning",
    ],
    cta: "Coming soon",
    highlighted: false,
    disabled: true,
  },
];
