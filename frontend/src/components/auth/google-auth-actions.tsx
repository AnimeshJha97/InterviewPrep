"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInWithGoogleButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signIn("google", {
          callbackUrl: "/",
          prompt: "select_account",
        })
      }
      style={{
        padding: "12px 18px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.2))",
        color: "#f8fafc",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      Continue with Google
    </button>
  );
}

export function SignOutButton() {
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
      Sign out
    </button>
  );
}
