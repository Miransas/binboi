import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, dbAvailable } from "@/db";

export const authEnabled = Boolean(
  dbAvailable && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
);

type SessionWithOptionalId = Session & {
  user?: Session["user"] & { id?: string };
};

const authConfig = authEnabled
  ? {
      adapter: DrizzleAdapter(db!),
      providers: [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID!,
          clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
      ],
      pages: {
        signIn: "/login",
      },
      callbacks: {
        session({ session, user }: { session: SessionWithOptionalId; user: User }) {
          if (session.user) {
            session.user.id = user.id;
          }
          return session;
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
        session({ session, token }: { session: SessionWithOptionalId; token: JWT }) {
          if (session.user) {
            session.user.id = token.sub ?? "local-preview";
          }
          return session;
        },
      },
    };

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
