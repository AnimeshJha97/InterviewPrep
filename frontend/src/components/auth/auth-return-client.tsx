"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BRAND } from "@/data/brand";

export function AuthReturnClient() {
  const router = useRouter();

  useEffect(() => {
    const storedReturnTo =
      window.sessionStorage.getItem("p3kit-auth-return-to") ??
      window.sessionStorage.getItem("p3kit-auth-return-to");
    const destination = storedReturnTo || "/?stay=1";

    window.sessionStorage.removeItem("p3kit-auth-return-to");
    window.sessionStorage.removeItem("p3kit-auth-return-to");
    router.replace(destination);
  }, [router]);

  return (
    <main className="auth-return-screen">
      <div className="auth-return-card">
        <div className="auth-return-kicker">{BRAND.productName}</div>
        <h1>Returning you to your page</h1>
        <p>Please wait while we restore your preparation workspace.</p>
      </div>
    </main>
  );
}
