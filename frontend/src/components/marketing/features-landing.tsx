"use client";

import { SignInWithGoogleButton, SignOutButton } from "@/components/auth/google-auth-actions";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface FeaturesLandingProps {
  isSignedIn: boolean;
  primaryCtaHref?: string;
}

const extractedSignals = [
  { title: "Skills", text: "Hard skills and core competencies" },
  { title: "Projects", text: "High-leverage delivery stories" },
  { title: "Experience", text: "Career progression and achievements" },
  { title: "Seniority", text: "Leadership and influence signals" },
  { title: "Target role", text: "Strategic gap analysis" },
  { title: "Interview type", text: "Tailored behavioral and technical focus" },
];

const questionEngineCards = [
  {
    icon: "▣",
    title: "Resume-aware technical questions",
    text: "Deep-dive probes into the exact technologies mentioned in your work history, designed to verify true expertise.",
  },
  {
    icon: "✳",
    title: "Project-based follow-ups",
    text: "Simulated interview scenarios built around your largest projects, testing architectural decisions and trade-offs.",
  },
  {
    icon: "≋",
    title: "Difficulty tagging",
    text: "Every question is rated from L1 to L7 expectations.",
  },
  {
    icon: "△",
    title: "Tricky question detection",
    text: "Identifies edge cases and common interviewer traps.",
  },
  {
    icon: "◔",
    title: "Estimated prep time",
    text: "Dynamic workload forecasting per section.",
  },
];

const roadmapItems = [
  { index: "01", title: "JavaScript Fundamentals", progress: "85% Complete", hours: "~ 4.5 Hours", width: "58%" },
  { index: "02", title: "System Design: Scalability", progress: "0% Complete", hours: "~ 12 Hours", width: "0%" },
  { index: "03", title: "Behavioral: Leadership", progress: "10% Complete", hours: "~ 8 Hours", width: "10%" },
];

const audienceCards = [
  {
    title: "For freshers",
    text: "Bridge the gap between academic projects and industry expectations with focused fundamental drills and project narration tools.",
  },
  {
    title: "For experienced developers",
    text: "Master the transition from technical execution to strategic leadership. Practice L5+ architectural patterns and executive presence.",
  },
  {
    title: "For role switchers",
    text: "Translate your previous experience into your new domain's vocabulary and identify transferable skills that hiring managers value.",
  },
];

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Us", href: "/contact" },
  { label: "Resources", href: "/features" },
];

export function FeaturesLanding({ isSignedIn, primaryCtaHref }: FeaturesLandingProps) {
  useMarketingReveal();

  return (
    <main className="marketing-shell features-shell">
      <div className="marketing-glow" />

      <header className="marketing-nav">
        <div className="marketing-nav-inner">
          <a href="/" className="marketing-brand">
            PrepWise by Orvion Labs
          </a>

          <nav className="marketing-nav-links" aria-label="Site pages">
            <a href="/" className="marketing-nav-link">
              Product
            </a>
            <a href="/features" className="marketing-nav-link active">
              Features
            </a>
            <a href="/how-it-works" className="marketing-nav-link">
              How it works
            </a>
            <a href="/pricing" className="marketing-nav-link">
              Pricing
            </a>
            <a href="/about" className="marketing-nav-link">
              About
            </a>
            <a href="/faq" className="marketing-nav-link">
              FAQ
            </a>
          </nav>

          <div className="marketing-nav-actions">
            {isSignedIn ? (
              <>
                <a href="/dashboard" className="marketing-link-button">
                  Dashboard
                </a>
                <SignOutButton label="Log out" />
              </>
            ) : (
              <SignInWithGoogleButton label="Get Started" compact />
            )}
          </div>
        </div>
      </header>

      <section className="marketing-hero features-hero">
        <div className="marketing-hero-inner">
          <div className="marketing-overline-pill marketing-float-in">Features</div>
          <h1 className="marketing-hero-title marketing-float-in marketing-float-in-delayed">
            Everything you need to prepare from <span>your own experience.</span>
          </h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft">
            PrepWise does more than generate questions. It creates a structured interview workspace based on your
            resume, role, confidence level, and timeline.
          </p>

          <div className="marketing-hero-actions marketing-float-in marketing-float-in-softest">
            {primaryCtaHref ? (
              <a href={primaryCtaHref} className="marketing-primary-button">
                Build my prep kit
              </a>
            ) : (
              <SignInWithGoogleButton label="Build my prep kit" />
            )}
          </div>
        </div>
      </section>

      <section className="marketing-section features-signals-section">
        <div className="features-signals-layout">
          <div className="features-visual-card reveal-section" data-reveal>
            <div className="features-visual-inner">
              <div className="features-visual-frame">
                <div className="features-visual-lines" />
                <div className="features-visual-panel">
                  <div className="features-visual-avatar-row">
                    <span className="features-visual-avatar" />
                    <span className="features-visual-avatar" />
                  </div>
                  <div className="features-visual-title">Resume Intelligence</div>
                  <div className="features-visual-copy">Drop your PDF. Extract structure instantly.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="features-signals-copy">
            <div className="marketing-section-header reveal-section" data-reveal>
              <h2>AI Signals Extracted</h2>
            </div>

            <div className="features-signals-grid">
              {extractedSignals.map((item) => (
                <article key={item.title} className="features-mini-card reveal-section" data-reveal>
                  <div className="features-mini-icon">◈</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>Personalized Question Engine</h2>
          <p>No generic question bank. Every challenge is generated to test the specific limits of your background.</p>
        </div>

        <div className="marketing-grid marketing-grid-2 features-grid-wide">
          {questionEngineCards.map((card) => (
            <article key={card.title} className="marketing-card reveal-section" data-reveal>
              <div className="marketing-feature-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section features-answer-section">
        <div className="features-answer-layout">
          <div className="features-answer-copy reveal-section" data-reveal>
            <div className="marketing-section-header">
              <h2>Guided Answer Workspace</h2>
              <p>
                The workspace provides a laboratory-grade environment to refine your responses. Learn not just what to
                say, but why the question exists.
              </p>
            </div>

            <div className="features-answer-points">
              <div>○ Why this is asked</div>
              <div>○ Senior-level framing</div>
              <div>○ Follow-up question mapping</div>
            </div>
          </div>

          <div className="features-answer-card reveal-section" data-reveal>
            <div className="features-answer-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="features-answer-meta">QUESTION ANALYSIS MODE</div>
            <div className="features-answer-question">Q: Describe a time you handled significant technical debt.</div>

            <div className="features-answer-columns">
              <div className="features-answer-block">
                <div className="features-answer-block-label">Ideal answer structure</div>
                <p>
                  Focus on the ROI of the refactor, quantify the impact on developer velocity and system stability.
                </p>
              </div>
              <div className="features-answer-block warning">
                <div className="features-answer-block-label">Common mistakes</div>
                <p>Talking too much about the technical “how” without mentioning business justification.</p>
              </div>
            </div>

            <div className="features-answer-quote">
              “I balanced the immediate need for product shipment against long-term maintenance costs by introducing a
              phased migration…”
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section roadmap-section">
        <div className="features-roadmap-header reveal-section" data-reveal>
          <div>
            <h2>Your Prep Roadmap</h2>
            <p>A dynamic syllabus generated from your career role gaps.</p>
          </div>
          <div className="features-roadmap-total">
            <span>TOTAL ESTIMATED</span>
            <strong>24h 45m</strong>
          </div>
        </div>

        <div className="features-roadmap-list">
          {roadmapItems.map((item) => (
            <article key={item.index} className="features-roadmap-item reveal-section" data-reveal>
              <div className="features-roadmap-index">{item.index}</div>
              <div className="features-roadmap-main">
                <div className="features-roadmap-top">
                  <div className="features-roadmap-title">{item.title}</div>
                  <div className="features-roadmap-meta">
                    <span>{item.progress}</span>
                    <span>{item.hours}</span>
                  </div>
                </div>
                <div className="features-roadmap-bar">
                  <div className="features-roadmap-fill" style={{ width: item.width }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <div className="features-audience-grid">
          {audienceCards.map((card) => (
            <article key={card.title} className="features-audience-card reveal-section" data-reveal>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section features-bottom-cta">
        <div className="features-bottom-panel reveal-section" data-reveal>
          <h2>Your resume already contains your interview roadmap.</h2>
          <p>Let Orvion Labs AI build the workspace you need to succeed.</p>
          {primaryCtaHref ? (
            <a href={primaryCtaHref} className="marketing-primary-button">
              Generate my prep kit
            </a>
          ) : (
            <SignInWithGoogleButton label="Generate my prep kit" />
          )}
        </div>
      </section>

      <footer className="marketing-footer">
        <div className="marketing-footer-inner">
          <div className="marketing-footer-brand">PrepWise</div>
          <div className="marketing-footer-meta">
            {footerLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
            <span>© 2026 Orvion Labs. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
