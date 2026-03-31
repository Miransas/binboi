import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  authDatabaseEnabled,
  authenticateCredentials,
  githubAuthEnabled,
  markOAuthUserVerified,
} from "@/lib/auth-system";

export const authEnabled = authDatabaseEnabled;

type SessionWithOptionalId = Session & {
  user?: Session["user"] & { id?: string };
};

const authConfig: NextAuthConfig = authEnabled
  ? {
      adapter: DrizzleAdapter(db!),
      providers: [
        Credentials({
          name: "Email and password",
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            const email = String(credentials?.email ?? "");
            const password = String(credentials?.password ?? "");

            try {
              return await authenticateCredentials({ email, password });
            } catch {
              return null;
            }
          },
        }),
        ...(githubAuthEnabled
          ? [
              GitHub({
                clientId: process.env.AUTH_GITHUB_ID!,
                clientSecret: process.env.AUTH_GITHUB_SECRET!,
              }),
            ]
          : []),
      ],
      pages: {
        signIn: "/login",
      },
      callbacks: {
        async signIn({ user, account }) {
          if (account?.provider === "github" && user.id) {
            await markOAuthUserVerified(user.id);
          }

          return true;
        },
        session({ session, user, token }) {
          const nextSession = session as SessionWithOptionalId;
          if (nextSession.user) {
            nextSession.user.id = user?.id ?? token?.sub ?? nextSession.user.id;
          }
          return nextSession;
        },
      },
    }
  : {
      session: { strategy: "jwt" as const },
      providers: [],
      pages: {
        signIn: "/login",
      },
      callbacks: {
        session({ session, token }) {
          const nextSession = session as SessionWithOptionalId;
          const nextToken = token as JWT;
          if (nextSession.user) {
            nextSession.user.id = nextToken.sub ?? "local-preview";
          }
          return nextSession;
        },
      },
    };

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
