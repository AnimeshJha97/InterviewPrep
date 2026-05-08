"use client";

import { SignInWithGoogleButton } from "@/components/auth/google-auth-actions";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { marketingPricingPlans } from "@/components/marketing/pricing-data";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface PricingLandingProps {
  isSignedIn: boolean;
  primaryCtaHref?: string;
}

export function PricingLanding({ isSignedIn, primaryCtaHref }: PricingLandingProps) {
  useMarketingReveal();

  const navItems = [
    { label: "Product", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing", active: true },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <main className="marketing-shell pricing-shell">
      <div className="marketing-glow" />
      <MarketingHeader isSignedIn={isSignedIn} navItems={navItems} />

      <section className="marketing-hero pricing-hero">
        <div className="marketing-hero-inner">
          <div className="marketing-overline-pill marketing-float-in">Pricing</div>
          <h1 className="marketing-hero-title marketing-float-in marketing-float-in-delayed">
            Simple pricing for focused <span>interview preparation.</span>
          </h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft">
            Start free, preview your personalized kit, and unlock the full workspace when you are ready to prepare
            seriously.
          </p>
        </div>
      </section>

      <section className="marketing-section pricing-section">
        <div className="pricing-grid">
          {marketingPricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-plan-card${plan.highlighted ? " highlighted" : ""} reveal-section`}
              data-reveal
            >
              {plan.badge ? <div className="pricing-plan-badge">{plan.badge}</div> : null}
              <div className="pricing-plan-name">{plan.name}</div>
              <div className="pricing-plan-price">{plan.price}</div>
              <p className="pricing-plan-copy">{plan.description}</p>

              <div className="pricing-plan-features">
                {plan.features.map((feature, index) => (
                  <div key={feature} className="pricing-plan-feature">
                    <span className="pricing-plan-feature-icon">{index === 0 && plan.name === "Practice Plus" ? "+" : "✓"}</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {plan.disabled ? (
                <div className="pricing-plan-button disabled">{plan.cta}</div>
              ) : isSignedIn ? (
                <a href={primaryCtaHref ?? "/onboarding?edit=1"} className={`pricing-plan-button${plan.highlighted ? " primary" : ""}`}>
                  {plan.cta}
                </a>
              ) : (
                <div className="pricing-plan-cta">
                  <SignInWithGoogleButton label={plan.cta} compact />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section pricing-bottom-section">
        <div className="pricing-bottom-panel reveal-section" data-reveal>
          <h2>Start with your resume. Unlock only when it feels useful.</h2>
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
