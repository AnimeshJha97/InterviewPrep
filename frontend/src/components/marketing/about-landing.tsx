"use client";

import { SignInWithGoogleButton } from "@/components/auth/google-auth-actions";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface AboutLandingProps {
  isSignedIn: boolean;
  primaryCtaHref?: string;
}

const valueCards = [
  { icon: "OO", title: "Clarity over noise" },
  { icon: "XX", title: "Practical preparation" },
  { icon: "[]", title: "Resume-aware guidance" },
  { icon: "**", title: "Honest AI assistance" },
];

export function AboutLanding({ isSignedIn, primaryCtaHref }: AboutLandingProps) {
  useMarketingReveal();

  const navItems = [
    { label: "Product", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about", active: true },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <main className="marketing-shell about-shell">
      <div className="marketing-glow" />
      <MarketingHeader isSignedIn={isSignedIn} navItems={navItems} />

      <section className="marketing-hero about-hero">
        <div className="marketing-hero-inner">
          <div className="marketing-overline-pill marketing-float-in">About PrepWise</div>
          <h1 className="marketing-hero-title marketing-float-in marketing-float-in-delayed">
            Built for people who want interview prep that actually <span>matches their background.</span>
          </h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft">
            PrepWise was created to solve a simple problem: most interview preparation is generic, but real interviews
            are personal to your resume, projects, experience, and target role.
          </p>
        </div>
      </section>

      <section className="marketing-section about-story-section">
        <div className="about-story-card reveal-section" data-reveal>
          <h2>Why we built PrepWise</h2>
          <p>
            PrepWise started from a simple frustration: most interview preparation resources are generic. They teach
            useful concepts, but they do not understand your resume, your projects, your work experience, or the role
            you are targeting. So we built PrepWise as a focused preparation workspace that turns a resume into a
            practical interview roadmap.
          </p>
        </div>
      </section>

      <section className="marketing-section about-labs-section">
        <div className="about-labs-layout">
          <div className="about-labs-copy reveal-section" data-reveal>
            <h2>Built by Orvion Labs</h2>
            <p>
              Orvion Labs is an independent product studio focused on building useful software products for real-world
              workflows. PrepWise is one of our first products, designed to help candidates prepare with more clarity,
              less noise, and better structure.
            </p>
          </div>

          <div className="about-labs-visual reveal-section" data-reveal>
            <div className="about-labs-flask">LAB</div>
          </div>
        </div>
      </section>

      <section className="marketing-section about-values-section">
        <div className="about-values-grid">
          {valueCards.map((card) => (
            <article key={card.title} className="about-value-card reveal-section" data-reveal>
              <div className="about-value-icon">{card.icon}</div>
              <h3>{card.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section about-quote-section">
        <div className="about-quote-card reveal-section" data-reveal>
          <div className="about-quote-mark">"</div>
          <p>
            &quot;PrepWise is designed as a preparation companion. It does not promise job guarantees. It helps you
            understand what to prepare, why it matters, and how to structure your answers.&quot;
          </p>
          <div className="about-quote-author">Founder note</div>
        </div>
      </section>

      <section className="marketing-section about-bottom-cta">
        <div className="about-bottom-panel reveal-section" data-reveal>
          <h2>Prepare with a plan built around your own experience.</h2>
          {primaryCtaHref ? (
            <a href={primaryCtaHref} className="marketing-primary-button">
              Build my prep kit
            </a>
          ) : (
            <SignInWithGoogleButton label="Build my prep kit" />
          )}
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
