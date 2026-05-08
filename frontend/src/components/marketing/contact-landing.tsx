"use client";

import { FormEvent, useState } from "react";

import { SignInWithGoogleButton } from "@/components/auth/google-auth-actions";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface ContactLandingProps {
  isSignedIn: boolean;
  primaryCtaHref?: string;
}

const contactCards = [
  {
    icon: "[]",
    title: "Support",
    description: "Technical assistance and account issues.",
    email: "support@prepwise.in",
  },
  {
    icon: "$$",
    title: "Payments",
    description: "Billing, subscriptions, and invoicing.",
    email: "billing@prepwise.in",
  },
  {
    icon: "<>",
    title: "Feedback",
    description: "Share your thoughts to help us improve.",
    email: "feedback@prepwise.in",
  },
  {
    icon: "[]",
    title: "Business Inquiries",
    description: "Partnerships and enterprise solutions.",
    email: "partners@prepwise.in",
  },
];

const topicOptions = [
  "Technical support",
  "Payments and billing",
  "Product feedback",
  "Business inquiry",
  "Other",
];

export function ContactLanding({ isSignedIn, primaryCtaHref }: ContactLandingProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useMarketingReveal();

  const navItems = [
    { label: "Product", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const topic = String(form.get("topic") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject = encodeURIComponent(`PrepWise contact: ${topic || "General inquiry"}`);
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`,
    );

    window.location.href = `mailto:support@prepwise.in?subject=${subject}&body=${body}`;
    setStatusMessage("Your email draft is ready. Send it from your mail app when you are ready.");
  }

  return (
    <main className="marketing-shell contact-shell">
      <div className="marketing-glow" />
      <MarketingHeader isSignedIn={isSignedIn} navItems={navItems} />

      <section className="marketing-hero contact-hero">
        <div className="marketing-hero-inner">
          <div className="marketing-overline-pill marketing-float-in">Contact</div>
          <h1 className="marketing-hero-title marketing-float-in marketing-float-in-delayed">
            Need help with <span>PrepWise?</span>
          </h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft">
            Reach out for support, payment questions, feedback, or partnership inquiries.
          </p>
        </div>
      </section>

      <section className="marketing-section contact-section">
        <div className="contact-layout">
          <div className="contact-card-stack">
            {contactCards.map((card) => (
              <article key={card.title} className="contact-card reveal-section" data-reveal>
                <div className="contact-card-icon">{card.icon}</div>
                <div className="contact-card-body">
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                  <a href={`mailto:${card.email}`} className="contact-card-link">
                    {card.email}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="contact-form-card reveal-section" data-reveal>
            <form onSubmit={handleSubmit} className="contact-form">
              <label className="contact-field">
                <span>Full Name</span>
                <input name="fullName" type="text" placeholder="Enter your full name" required />
              </label>

              <label className="contact-field">
                <span>Email Address</span>
                <input name="email" type="email" placeholder="Enter your email address" required />
              </label>

              <label className="contact-field">
                <span>Topic</span>
                <select name="topic" defaultValue="" required>
                  <option value="" disabled>
                    Select a topic
                  </option>
                  {topicOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="contact-field">
                <span>Message</span>
                <textarea name="message" rows={7} placeholder="How can we help you?" required />
              </label>

              <div className="contact-note">
                We usually respond as soon as possible. Please include the email used for your PrepWise account if your
                message is about an existing kit.
              </div>

              {statusMessage ? <div className="contact-status">{statusMessage}</div> : null}

              <button type="submit" className="contact-submit-button">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="marketing-section contact-bottom-cta">
        <div className="about-bottom-panel reveal-section" data-reveal>
          <h2>Start with your resume. Reach out whenever you need help.</h2>
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
