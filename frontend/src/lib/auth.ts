import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";

import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

const googleClientId = process.env.AUTH_GOOGLE_ID ?? "google-client-id-placeholder";
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? "google-client-secret-placeholder";
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      await connectToDatabase();

      await UserModel.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        {
          $set: {
            name: user.name ?? "",
            image: user.image ?? "",
            googleId: account?.providerAccountId ?? "",
          },
          $setOnInsert: {
            plan: "free",
            onboardingCompleted: false,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      return true;
    },
    async jwt({ token }) {
      if (!token.email) {
        return token;
      }

      await connectToDatabase();

      const dbUser = await UserModel.findOne({ email: token.email.toLowerCase() })
        .select("_id onboardingCompleted plan name image")
        .lean();

      if (dbUser) {
        token.userId = String(dbUser._id);
        token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
        token.plan = dbUser.plan ?? "free";
        token.name = dbUser.name ?? token.name;
        token.picture = dbUser.image ?? token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
        session.user.plan = (token.plan as "free" | "paid") ?? "free";
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
