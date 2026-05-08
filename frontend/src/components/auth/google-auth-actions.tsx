"use client";

import { signIn, signOut } from "next-auth/react";

interface SignInWithGoogleButtonProps {
  label?: string;
  compact?: boolean;
}

interface SignOutButtonProps {
  label?: string;
}

export function SignInWithGoogleButton({
  label = "Continue with Google",
  compact = false,
}: SignInWithGoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        const currentUrl = new URL(window.location.href);

        currentUrl.searchParams.set("stay", "1");
        currentUrl.searchParams.delete("error");
        currentUrl.searchParams.delete("code");
        currentUrl.searchParams.delete("state");

        const callbackUrl = `${currentUrl.pathname}${currentUrl.search}`;

        window.sessionStorage.setItem("prepwise-auth-return-to", callbackUrl);

        signIn("google", {
          callbackUrl,
          prompt: "select_account",
        });
      }}
      style={{
        padding: compact ? "10px 16px" : "12px 18px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.2))",
        color: "#f8fafc",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: compact ? 13 : 14,
      }}
    >
      {label}
    </button>
  );
}

export function SignOutButton({ label = "Sign out" }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "transparent",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}
