import type { Metadata } from "next";

import { BRAND } from "@/data/brand";
import favicon from "@/data/assets/favicon.ico";

import "./globals.css";

export const metadata: Metadata = {
  title: BRAND.fullName,
  description: BRAND.shortDescription,
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
