"use client";

import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface FaqLandingProps {
  isSignedIn: boolean;
}

export function FaqLanding({ isSignedIn }: FaqLandingProps) {
  useMarketingReveal();

  const navItems = [
    { label: "Product", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq", active: true },
  ];

  return (
    <main className="marketing-shell faq-shell">
      <div className="marketing-glow" />
      <MarketingHeader isSignedIn={isSignedIn} navItems={navItems} />

      <section className="marketing-hero faq-hero">
        <div className="marketing-hero-inner">
          <h1 className="marketing-hero-title marketing-float-in faq-title">Frequently Asked Questions</h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft faq-subtitle">
            Find answers to common questions about PrepWise and how the platform builds personalized interview
            preparation from your resume.
          </p>
        </div>
      </section>

      <section className="marketing-section faq-page-section">
        <FaqAccordion />
      </section>

      <MarketingFooter />
    </main>
  );
}
