"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthReturnClient() {
  const router = useRouter();

  useEffect(() => {
    const storedReturnTo = window.sessionStorage.getItem("prepwise-auth-return-to");
    const destination = storedReturnTo || "/?stay=1";

    window.sessionStorage.removeItem("prepwise-auth-return-to");
    router.replace(destination);
  }, [router]);

  return (
    <main className="auth-return-screen">
      <div className="auth-return-card">
        <div className="auth-return-kicker">PrepWise</div>
        <h1>Returning you to your page</h1>
        <p>Please wait while we restore your preparation workspace.</p>
      </div>
    </main>
  );
}
