"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { SignInWithGoogleButton } from "@/components/auth/google-auth-actions";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { marketingFaqItems } from "@/components/marketing/faq-data";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { marketingPricingPlans } from "@/components/marketing/pricing-data";
import { BRAND } from "@/data/brand";

interface HomeLandingProps {
  isSignedIn: boolean;
  primaryCtaHref?: string;
}

type SectionId = "product" | "how-it-works" | "pricing" | "about" | "faq" | "features";

const navItems: Array<{ id?: SectionId; label: string; href?: string }> = [
  { id: "product", label: "Product" },
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

const problemCards = [
  {
    icon: "△",
    title: "Your projects are ignored",
    text: "Generic question lists do not connect interview questions to the work you have actually shipped.",
  },
  {
    icon: "✦",
    title: "Your level is guessed",
    text: "Standard platforms do not know your past projects, making it impossible to calibrate question depth well.",
  },
  {
    icon: "⌁",
    title: "Your weak areas stay hidden",
    text: "Entering interviews without knowing your real blind spots creates wasted prep time and weak answers.",
  },
];

const featureCards = [
  {
    icon: "▣",
    title: "Resume-aware questions",
    text: "Questions tailored to your actual experience, stack, and projects.",
  },
  {
    icon: "◫",
    title: "Section-wise roadmap",
    text: "Structured learning paths focused on your target role requirements.",
  },
  {
    icon: "✓",
    title: "Guided answer frameworks",
    text: "Step-by-step guidance for building strong interview-ready answers.",
  },
  {
    icon: "▤",
    title: "Follow-up questions",
    text: "Dynamic probing questions to simulate real interview pressure.",
  },
  {
    icon: "◌",
    title: "Progress tracking",
    text: "Visual insights into your readiness across different competencies.",
  },
  {
    icon: "◇",
    title: "Free and paid access control",
    text: "Flexible plans to match your preparation needs and budget.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Sign in with Google",
    text: "Quick access once your account is connected.",
  },
  {
    step: "02",
    title: "Upload resume and target role",
    text: "Provide context for the AI to analyze.",
  },
  {
    step: "03",
    title: `Wait while ${BRAND.productName} builds your kit`,
    text: "Our AI generates section priorities and role-specific questions.",
  },
  {
    step: "04",
    title: "Practice section-wise with progress tracking",
    text: "Master each topic systematically.",
  },
];

const faqItems = marketingFaqItems.map((item) => item.question);

function useSectionNavigation() {
  const [activeSection, setActiveSection] = useState<SectionId>("product");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    const navigationEntry = window.performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    window.history.scrollRestoration = "manual";

    if (navigationEntry?.type === "reload") {
      window.scrollTo(0, 0);
    }

    document.body.classList.add("marketing-reveal-ready");

    const sections = document.querySelectorAll<HTMLElement>("[data-marketing-section]");
    const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");

    revealTargets.forEach((element, index) => {
      element.classList.remove("is-visible");
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    });

    const refreshVisibleState = () => {
      revealTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;

        if (isInViewport) {
          element.classList.add("is-visible");
        }
      });
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    revealTargets.forEach((element) => revealObserver.observe(element));

    requestAnimationFrame(() => {
      requestAnimationFrame(refreshVisibleState);
    });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveSection(visibleEntry.target.dataset.marketingSection as SectionId);
        }
      },
      {
        threshold: [0.22, 0.45, 0.7],
        rootMargin: "-18% 0px -55% 0px",
      },
    );

    sections.forEach((section) => observerRef.current?.observe(section));

    const handlePageShow = () => {
      requestAnimationFrame(() => {
        refreshVisibleState();
      });
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("resize", handlePageShow);

    return () => {
      revealObserver.disconnect();
      observerRef.current?.disconnect();
      observerRef.current = null;
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("resize", handlePageShow);
    };
  }, []);

  const scrollToSection = (sectionId: SectionId) => {
    const target = document.querySelector<HTMLElement>(`[data-marketing-section="${sectionId}"]`);

    if (!target) {
      return;
    }

    const navOffset = 92;
    const nextTop = target.getBoundingClientRect().top + window.scrollY - navOffset;

    window.scrollTo({
      top: nextTop,
      behavior: "smooth",
    });

    window.history.replaceState({}, "", window.location.pathname + window.location.search);
    setActiveSection(sectionId);
  };

  return { activeSection, scrollToSection };
}

export function HomeLanding({ isSignedIn, primaryCtaHref }: HomeLandingProps) {
  const { activeSection, scrollToSection } = useSectionNavigation();

  const footerLinks = useMemo(
    () => [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact Us" },
      { href: "/features", label: "Resources" },
    ],
    [],
  );

  return (
    <main className="marketing-shell">
      <div className="marketing-glow" />

      <MarketingHeader
        isSignedIn={isSignedIn}
        navItems={navItems.map((item) =>
          item.href
            ? { label: item.label, href: item.href }
            : {
                label: item.label,
                active: activeSection === item.id,
                onClick: () => scrollToSection(item.id!),
              },
        )}
      />

      <section className="marketing-hero">
        <div className="marketing-hero-inner">
          <div className="marketing-overline-pill marketing-float-in">{BRAND.fullName}</div>
          <h1 className="marketing-hero-title marketing-float-in marketing-float-in-delayed">
            AI interview prep built around your <span>actual resume.</span>
          </h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft">
            Stop practicing generic questions. {BRAND.productName} analyzes your experience and generates a personalized workspace
            with targeted questions, guided roadmaps, and intelligent feedback.
          </p>

          <div className="marketing-hero-actions marketing-float-in marketing-float-in-softest">
            {primaryCtaHref ? (
              <a href={primaryCtaHref} className="marketing-primary-button">
                Build my prep kit
              </a>
            ) : (
              <SignInWithGoogleButton label="Build my prep kit" />
            )}
            <a href="/how-it-works" className="marketing-secondary-button">
              See how it works
            </a>
          </div>

          <div className="marketing-preview marketing-float-in marketing-float-in-softest" data-marketing-section="product">
            <aside className="marketing-preview-sidebar">
              <div className="marketing-preview-label">MY PREP KIT</div>
              <div className="marketing-preview-nav-item active">Interview Prep Demo</div>
              <div className="marketing-preview-nav-item">Resume & Patterns</div>
              <div className="marketing-preview-nav-item">System Design</div>
            </aside>

            <div className="marketing-preview-main">
              <div className="marketing-preview-top">
                <div>
                  <div className="marketing-preview-title">JavaScript Fundamentals</div>
                </div>
                <div className="marketing-preview-status">4 of 10 completed</div>
              </div>

              <div className="marketing-question-card">
                <div className="marketing-question-row">
                  <div className="marketing-question-title">Explain closures and their use cases.</div>
                  <div className="marketing-question-chip">Medium</div>
                </div>
                <div className="marketing-question-copy">
                  Based on your experience in React apps and reusable component design.
                </div>
              </div>

              <div className="marketing-question-card">
                <div className="marketing-question-row">
                  <div className="marketing-question-title">How does the event loop work?</div>
                  <div className="marketing-question-chip hard">Hard</div>
                </div>
                <div className="marketing-question-copy">
                  Targeted specifically to your senior frontend role and async-heavy project patterns.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" data-marketing-section="about">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>Generic interview prep does not know your story.</h2>
          <p>
            The traditional approach wastes time on topics you already know or questions that do not apply to your
            specific background.
          </p>
        </div>

        <div className="marketing-grid marketing-grid-3">
          {problemCards.map((card) => (
            <article key={card.title} className="marketing-card problem reveal-section" data-reveal>
              <div className="marketing-card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section process" data-marketing-section="features">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>{BRAND.productName} turns your resume into a preparation plan</h2>
          <p>A streamlined process to get you ready for your next big interview.</p>
        </div>

        <div className="marketing-process-line reveal-section" data-reveal />
        <div className="marketing-process-grid">
          <div className="marketing-process-card reveal-section" data-reveal>
            <div className="marketing-process-icon">⬒</div>
            <span>Resume upload</span>
          </div>
          <div className="marketing-process-card featured reveal-section" data-reveal>
            <div className="marketing-process-icon">◉</div>
            <span>AI analysis</span>
          </div>
          <div className="marketing-process-card reveal-section" data-reveal>
            <div className="marketing-process-icon">▣</div>
            <span>Personalized prep kit</span>
          </div>
        </div>
      </section>

      <section className="marketing-section" data-marketing-section="product">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>Everything you need to succeed</h2>
        </div>

        <div className="marketing-grid marketing-grid-3">
          {featureCards.map((card) => (
            <article key={card.title} className="marketing-card reveal-section" data-reveal>
              <div className="marketing-feature-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" data-marketing-section="how-it-works">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>How to start practicing</h2>
        </div>

        <div className="marketing-steps-grid">
          {howItWorks.map((step) => (
            <article key={step.step} className="marketing-step-card reveal-section" data-reveal>
              <div className="marketing-step-index">{step.step}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" data-marketing-section="pricing">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>Simple, transparent pricing</h2>
        </div>

        <div className="marketing-pricing-grid">
          {marketingPricingPlans.map((card) => (
            <article
              key={card.name}
              className={`marketing-pricing-card${card.highlighted ? " highlighted" : ""} reveal-section`}
              data-reveal
            >
              {card.badge ? <div className="marketing-pricing-badge">{card.badge}</div> : null}
              <div className="marketing-pricing-name">{card.name}</div>
              <div className="marketing-pricing-price">
                {card.price}
                {card.note ? <span>{card.note}</span> : null}
              </div>
              <div className="marketing-pricing-list">
                {card.features.slice(0, 3).map((feature) => (
                  <div key={feature} className="marketing-pricing-item">
                    ✓ {feature}
                  </div>
                ))}
              </div>
              {isSignedIn ? (
                <a href="/onboarding?edit=1" className={`marketing-pricing-button${card.highlighted ? " primary" : ""}`}>
                  {card.cta}
                </a>
              ) : (
                <SignInWithGoogleButton
                  label={card.cta}
                  compact
                  className={`marketing-pricing-button${card.highlighted ? " primary" : ""}`}
                />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section faq" data-marketing-section="faq">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>Frequently Asked Questions</h2>
        </div>

        <FaqAccordion />

        <div className="marketing-faq-list">
          {faqItems.map((item, index) => (
            <details key={item} className="marketing-faq-item reveal-section" data-reveal>
              <summary>
                <span>{item}</span>
                <span>{index === 0 ? "−" : "+"}</span>
              </summary>
              <p>
                {BRAND.productName} uses your resume, target role, and project context to build a structured interview prep kit.
                This section will expand into a full FAQ page next.
              </p>
            </details>
          ))}
        </div>
      </section>

      <MarketingFooter links={footerLinks} />
    </main>
  );
}
