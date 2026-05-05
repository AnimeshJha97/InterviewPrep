import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PrepWise by Orvion Labs",
  description: "PrepWise helps candidates turn resumes into personalized interview prep dashboards with AI-generated questions, answers, and progress tracking.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
