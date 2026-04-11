"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ── types ─────────────────────────────────────────────────────────────────────

type SessionUser = {
  id: string;
  email: string;
  name: string;
  plan: string;
};

type Session = { user: SessionUser };
type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  data: Session | null;
  status: SessionStatus;
};

// ── context ───────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue>({
  data: null,
  status: "loading",
});

// ── public API ────────────────────────────────────────────────────────────────

export function useSession() {
  return useContext(SessionContext);
}

export async function signOut() {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
  window.location.href = "/login";
}

// ── provider ──────────────────────────────────────────────────────────────────

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json() as Promise<{ authenticated: boolean; user: SessionUser | null }>)
      .then((body) => {
        if (body.authenticated && body.user) {
          setData({ user: body.user });
          setStatus("authenticated");
        } else {
          setData(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setData(null);
        setStatus("unauthenticated");
      });
  }, []);

  return (
    <SessionContext.Provider value={{ data, status }}>
      {children}
    </SessionContext.Provider>
  );
}
