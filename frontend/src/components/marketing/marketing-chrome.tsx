"use client";

import { SignInWithGoogleButton, SignOutButton } from "@/components/auth/google-auth-actions";

export interface MarketingNavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface MarketingFooterLink {
  label: string;
  href: string;
}

interface MarketingHeaderProps {
  isSignedIn: boolean;
  navItems: MarketingNavItem[];
}

interface MarketingFooterProps {
  brand?: string;
  links?: MarketingFooterLink[];
  copyright?: string;
}

export const defaultMarketingFooterLinks: MarketingFooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Us", href: "/contact" },
  { label: "Resources", href: "/features" },
];

export function MarketingHeader({ isSignedIn, navItems }: MarketingHeaderProps) {
  return (
    <header className="marketing-nav">
      <div className="marketing-nav-inner">
        <a href="/" className="marketing-brand">
          PrepWise by Orvion Labs
        </a>

        <nav className="marketing-nav-links" aria-label="Site pages">
          {navItems.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className={`marketing-nav-link${item.active ? " active" : ""}`}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                className={`marketing-nav-button${item.active ? " active" : ""}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ),
          )}
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
  );
}

export function MarketingFooter({
  brand = "PrepWise by Orvion Labs",
  links = defaultMarketingFooterLinks,
  copyright = "© 2024 Orvion Labs. All rights reserved.",
}: MarketingFooterProps) {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-inner">
        <div className="marketing-footer-brand">{brand}</div>
        <div className="marketing-footer-meta">
          {links.map((item) => (
            <a key={item.label} href={item.href} className="marketing-footer-link">
              {item.label}
            </a>
          ))}
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
