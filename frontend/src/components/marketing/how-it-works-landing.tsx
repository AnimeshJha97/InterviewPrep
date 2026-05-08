"use client";

import { SignInWithGoogleButton, SignOutButton } from "@/components/auth/google-auth-actions";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface HowItWorksLandingProps {
  isSignedIn: boolean;
  primaryCtaHref?: string;
}

const timelineSteps = [
  {
    step: "01",
    side: "left" as const,
    title: "Sign in securely",
    text: "Authenticate with Google or LinkedIn to keep your data synced and your preparation progress saved across devices.",
    panel: (
      <div className="how-panel-auth">
        <div className="how-auth-button">Continue with Google</div>
        <div className="how-auth-button secondary">Continue with LinkedIn</div>
      </div>
    ),
  },
  {
    step: "02",
    side: "right" as const,
    title: "Add your interview context",
    text: "Specify target role, seniority level, and company goals. Our AI uses this to filter relevant technical challenges.",
    panel: (
      <div className="how-context-card">
        <div className="how-context-grid">
          <div>
            <div className="how-context-label">TARGET ROLE</div>
            <div className="how-context-input">Senior Frontend Engineer</div>
          </div>
          <div>
            <div className="how-context-label">EXPERIENCE</div>
            <div className="how-context-input">Senior</div>
          </div>
        </div>
        <div className="how-context-tags">
          <span>Zeta</span>
          <span>Razor</span>
          <span>Airbnb</span>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    side: "left" as const,
    title: "Upload your resume",
    text: "Our AI parses your experience, projects, and tech stack signals to find the gaps in your knowledge.",
    panel: (
      <div className="how-upload-card">
        <div className="how-upload-icon">⬒</div>
        <div className="how-upload-title">Drop resume</div>
        <div className="how-upload-copy">PDF or DOCX supported</div>
        <div className="how-upload-button">Browse</div>
      </div>
    ),
  },
  {
    step: "04",
    side: "right" as const,
    title: "AI builds your kit",
    text: "In seconds, we generate a custom curriculum tailored to your profile and industry benchmarks.",
    panel: (
      <div className="how-progress-card">
        <div className="how-progress-top">
          <div className="how-progress-badge">✦</div>
          <span>ANALYZING PROFILE...</span>
        </div>
        <div className="how-progress-track">
          <div className="how-progress-fill" />
        </div>
      </div>
    ),
  },
  {
    step: "05",
    side: "left" as const,
    title: "Practice section-wise",
    text: "Start your drills with structured guidance, real-world feedback, and solution breakdowns for every module.",
    panel: (
      <div className="how-practice-card">
        <div className="how-practice-row">
          <span>SYSTEM DESIGN</span>
          <span>◔</span>
        </div>
        <div className="how-practice-value">Scaling WebSockets</div>
        <div className="how-practice-row muted">
          <span>BEHAVIORAL</span>
          <span>◔</span>
        </div>
        <div className="how-practice-value">Conflict Resolution</div>
      </div>
    ),
  },
];

const analysisItems = [
  { title: "Skills and tools", text: "Extracts precise competencies in languages, frameworks, and infra." },
  { title: "Projects and responsibilities", text: "Identifies project context and scope of past engineering initiatives." },
  { title: "Experience level", text: "Calibrates difficulty based on junior, senior, or staff expectations." },
  { title: "Target role", text: "Aligns prep with specific industry expectations for your desired title." },
  { title: "Optional job description", text: "Hyper-tailors the kit to match a specific role you applied for." },
  { title: "Confidence and timeline", text: "Optimizes the study schedule based on your available prep window." },
];

const footerLinks = [
  { label: "Product", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact Us", href: "/contact" },
];

export function HowItWorksLanding({ isSignedIn, primaryCtaHref }: HowItWorksLandingProps) {
  useMarketingReveal();

  return (
    <main className="marketing-shell how-shell">
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
            <a href="/features" className="marketing-nav-link">
              Features
            </a>
            <a href="/how-it-works" className="marketing-nav-link active">
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

      <section className="marketing-hero how-hero">
        <div className="marketing-hero-inner">
          <div className="marketing-overline-pill marketing-float-in">How It Works</div>
          <h1 className="marketing-hero-title marketing-float-in marketing-float-in-delayed">
            From resume upload to interview prep <span>kit in minutes.</span>
          </h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft">
            PrepWise guides you through a simple setup, analyzes your resume, and creates a personalized preparation
            dashboard based on your actual background.
          </p>
        </div>
      </section>

      <section className="marketing-section how-timeline-section">
        <div className="how-timeline">
          <div className="how-timeline-line" />
          {timelineSteps.map((item) => (
            <div key={item.step} className={`how-timeline-item ${item.side}`}>
              <div className="how-timeline-node reveal-section" data-reveal>
                <span>{item.step}</span>
              </div>
              <article className={`how-timeline-card ${item.side} reveal-section`} data-reveal>
                <div className="how-step-label">STEP {item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.panel}
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="marketing-section how-analysis-section">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>What PrepWise analyzes</h2>
          <p>Our Orvion AI Engine parses high-fidelity signals from your background.</p>
        </div>

        <div className="marketing-grid marketing-grid-3">
          {analysisItems.map((item) => (
            <article key={item.title} className="marketing-card reveal-section" data-reveal>
              <div className="marketing-feature-icon">◈</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section how-result-section">
        <div className="marketing-section-header centered reveal-section" data-reveal>
          <h2>The Result: Your Personalized Dashboard</h2>
        </div>

        <div className="how-dashboard-mock reveal-section" data-reveal>
          <aside className="how-dashboard-sidebar">
            <div className="how-dashboard-badge">PrepKit v2.4</div>
            <div className="how-dashboard-menu">
              <div>JavaScript Core</div>
              <div>System Design</div>
              <div>Behavioral Drill</div>
            </div>
            <div className="how-dashboard-progress">
              <div>Overall progress</div>
              <div>65%</div>
            </div>
          </aside>

          <div className="how-dashboard-main">
            <div className="how-dashboard-header">
              <div>
                <h3>JavaScript Mastery</h3>
                <p>Curated based on your Senior Frontend Engineer goals.</p>
              </div>
              <div className="how-dashboard-hours">12.5 Estimated hours left</div>
            </div>

            <div className="how-dashboard-cards">
              <div className="how-dashboard-question-card">
                <div className="how-dashboard-chip hard">HARD</div>
                <div className="how-dashboard-question-title">Closures & Execution Context</div>
                <p>Explain how closures maintain scope and prevent memory leak patterns in large-scale React code.</p>
              </div>
              <div className="how-dashboard-question-card">
                <div className="how-dashboard-chip medium">MEDIUM</div>
                <div className="how-dashboard-question-title">Asynchronous Patterns</div>
                <p>Handle multiple API calls with Promise.allSettled and manage graceful error boundaries.</p>
              </div>
            </div>

            <div className="how-dashboard-cta">
              <div className="how-dashboard-score">
                <strong>65%</strong>
                <span>done</span>
              </div>
              <div className="how-dashboard-cta-copy">
                <h4>Ready for Mock Interviews?</h4>
                <p>You&apos;ve covered the core pillars. We recommend starting active drills now.</p>
              </div>
              <div className="how-dashboard-cta-button">Start Mock Drill</div>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section how-quote-section">
        <div className="how-quote-card reveal-section" data-reveal>
          <div className="how-quote-icon">◉</div>
          <p>
            &quot;PrepWise is designed to support your preparation, not replace your own understanding. Use the generated
            kit as a structured guide and practice actively.&quot;
          </p>
        </div>
      </section>

      <section className="marketing-section how-bottom-cta">
        <div className="how-bottom-panel reveal-section" data-reveal>
          <h2>Turn your resume into a focused prep plan.</h2>
          {primaryCtaHref ? (
            <a href={primaryCtaHref} className="marketing-primary-button">
              Start with my resume →
            </a>
          ) : (
            <SignInWithGoogleButton label="Start with my resume" />
          )}
        </div>
      </section>

      <footer className="marketing-footer">
        <div className="marketing-footer-inner">
          <div className="marketing-footer-brand">PrepWise by Orvion Labs</div>
          <div className="marketing-footer-meta">
            <span>© 2026 Orvion Labs. All rights reserved.</span>
            {footerLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
