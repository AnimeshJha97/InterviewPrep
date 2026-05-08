"use client";

import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-chrome";
import { useMarketingReveal } from "@/components/marketing/use-marketing-reveal";

interface TermsLandingProps {
  isSignedIn: boolean;
}

const legalSections = [
  {
    title: "Introduction",
    body: "Welcome to PrepWise by Orvion Labs. These Terms and Conditions govern your use of our website and services. By accessing or using PrepWise, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.",
  },
  {
    title: "1. Use of Service",
    body: "PrepWise provides AI-powered interview preparation tools. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service.",
  },
  {
    title: "2. Account and Authentication",
    body: "To use certain features of the service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.",
  },
  {
    title: "3. Resume Uploads and User Content",
    body: "By uploading your resume or providing other content to PrepWise, you grant us the right to process this information to provide our services to you. We do not claim ownership of your content, but we need these rights to operate the service.",
  },
  {
    title: "4. AI-Generated Content",
    body: "PrepWise utilizes artificial intelligence to generate feedback and interview scenarios. While we strive for accuracy, AI-generated content is provided as is and should be used as a guide rather than definitive professional advice.",
  },
  {
    title: "5. No Job Guarantee",
    body: "Our services are designed to assist you in preparing for interviews. However, we do not guarantee employment, job offers, or specific outcomes as a result of using PrepWise.",
  },
  {
    title: "6. Payments and Access",
    body: "Access to premium features may require payment. All fees are clearly stated before purchase. We reserve the right to change our pricing at any time, but any changes will not affect past purchases.",
  },
  {
    title: "7. Refunds",
    body: "Refund policies for premium services will be specified at the point of sale. Generally, due to the digital nature of the service, refunds are provided on a case-by-case basis at our sole discretion.",
  },
  {
    title: "8. Acceptable Use",
    body: "You must not use the service to harm, threaten, or harass others. Automated data extraction or scraping without permission is strictly prohibited.",
  },
  {
    title: "9. Service Availability",
    body: "We aim to ensure the service is available at all times, but we cannot guarantee uninterrupted access. We reserve the right to suspend or withdraw the service for maintenance or operational reasons without notice.",
  },
  {
    title: "10. Limitation of Liability",
    body: "To the maximum extent permitted by law, PrepWise by Orvion Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
  },
  {
    title: "11. Changes to Terms",
    body: "We may revise these Terms and Conditions at any time. The most current version will always be posted on this page. By continuing to use the service after those revisions become effective, you agree to be bound by the revised terms.",
  },
];

export function TermsLanding({ isSignedIn }: TermsLandingProps) {
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
          <h1 className="marketing-hero-title marketing-float-in legal-title">Terms and Conditions</h1>
          <p className="marketing-hero-copy marketing-float-in marketing-float-in-soft legal-subtitle">
            Last updated: October 2023
          </p>
        </div>
      </section>

      <section className="marketing-section legal-section">
        <div className="legal-card reveal-section" data-reveal>
          {legalSections.map((section) => (
            <div key={section.title} className="legal-block">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
          <div className="legal-block">
            <h2>12. Contact</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at{" "}
              <a href="mailto:support@prepwise.in">support@prepwise.in</a>.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
