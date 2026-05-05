import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Animesh Jha Interview Prep",
  description: "A structured interview preparation guide for senior full stack and technical leadership roles.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
