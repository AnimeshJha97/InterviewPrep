"use client";

import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface PrivacyLandingProps {
  isSignedIn: boolean;
}

const privacySections = [
  {
    title: "1. Information We Collect",
    body: "We may collect account information such as your name and email, profile details such as role and experience, uploaded resumes and job descriptions, usage information, and payment status when applicable.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use this data to create accounts, analyze resumes, generate personalized interview kits, save progress, provide paid access, and improve the product experience over time.",
  },
  {
    title: "3. Resume and Uploaded Content",
    body: "Uploaded resumes and role context are used only for kit generation and personalization. We do not sell your resume data or uploaded content.",
  },
  {
    title: "4. AI Processing",
    body: "PrepWise may use third-party AI models to process resume and preparation data. Content is shared only to complete the requested generation and personalization tasks.",
  },
  {
    title: "5. Data Storage",
    body: "We store profiles, uploaded resume content, generated preparation kits, notes, and completion progress in our database to support your workspace.",
  },
  {
    title: "6. Payments",
    body: "Payments are handled by third-party providers such as Razorpay or equivalent processors. We do not store full payment credentials on PrepWise systems.",
  },
  {
    title: "7. Data Sharing",
    body: "We do not sell personal information. We may share limited data with necessary service providers for hosting, AI processing, analytics, authentication, and payment handling.",
  },
];

export function PrivacyLanding({ isSignedIn }: PrivacyLandingProps) {
  useMarketingReveal();

  const navItems = [
    { label: "Product", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <main className="marketing-shell legal-shell">
      <div className="marketing-glow" />
      <MarketingHeader isSignedIn={isSignedIn} navItems={navItems} />

      <section className="marketing-hero legal-hero">
        <div className="marketing-hero-inner">
          <h1 className="marketing-hero-title marketing-float-in legal-title">Privacy Policy</h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft legal-subtitle">
            Last updated: October 26, 2023
          </p>
        </div>
      </section>

      <section className="marketing-section legal-section">
        <div className="legal-card reveal-section" data-reveal>
          <div className="legal-intro">
            PrepWise by Orvion Labs respects your privacy. This Privacy Policy explains how we collect, use, store,
            and protect information when you use PrepWise.
          </div>

          {privacySections.map((section) => (
            <div key={section.title} className="legal-block">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}

          <div className="legal-contact-panel">
            <h2>12. Contact</h2>
            <p>
              For any privacy-related questions, please reach out to us at{" "}
              <a href="mailto:support@prepwise.in">support@prepwise.in</a>.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
