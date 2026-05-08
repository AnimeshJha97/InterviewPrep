import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  title: "PrepWise by Orvion Labs",
  description: "PrepWise helps candidates turn resumes into personalized interview prep dashboards with AI-generated questions, answers, and progress tracking.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Script
          id="prepwise-scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ("scrollRestoration" in history) {
                history.scrollRestoration = "manual";
              }
              var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
              if (nav && nav.type === "reload") {
                window.scrollTo(0, 0);
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
