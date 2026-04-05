import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const authInputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#86a9ff]/35 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-70";

export const authPrimaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d9e5ff] px-4 py-3.5 text-sm font-semibold text-[#07111f] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70";

export const authSecondaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70";

export const authInlinePrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#d9e5ff] px-4 py-2.5 text-sm font-semibold text-[#07111f] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70";

export const authInlineSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70";

export const authMutedTextClass = "text-sm leading-7 text-[rgba(194,203,219,0.74)]";

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.95),rgba(5,9,18,0.99))] p-6 shadow-[0_42px_140px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(134,169,255,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function AuthLoadingCard({
  title = "Preparing your session",
  description = "Loading the authentication screen and query parameters.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="space-y-6">
      <AuthCard>
        <AuthHeader
          eyebrow="Loading"
          title={title}
          description={description}
        />
        <div className="mt-6 h-32 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.03]" />
      </AuthCard>
    </div>
  );
}

export function AuthHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#86a9ff]/16 bg-[#86a9ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfe7ff]">
          {eyebrow}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Binboi auth
        </span>
      </div>

      <h1 className="mt-5 text-3xl font-black tracking-[-0.05em] text-white sm:text-[2.6rem] sm:leading-[1.02]">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(194,203,219,0.8)] sm:text-base sm:leading-8">
        {description}
      </p>
    </div>
  );
}

export function AuthFeatureStrip({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AuthField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </span>
      {description ? (
        <span className="mt-2 block text-xs leading-6 text-zinc-500">{description}</span>
      ) : null}
      <div className="mt-3">{children}</div>
    </label>
  );
}

export function AuthStatus({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warning" | "error";
  children: ReactNode;
}) {
  const classes =
    tone === "success"
      ? "border-emerald-400/18 bg-emerald-400/8 text-emerald-100"
      : tone === "warning"
        ? "border-amber-300/18 bg-amber-400/8 text-[#f6dfc7]"
        : tone === "error"
          ? "border-rose-400/18 bg-rose-500/8 text-rose-100"
          : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div className={`rounded-[1.5rem] border px-4 py-3 text-sm leading-7 ${classes}`}>
      {children}
    </div>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-sm text-zinc-400">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
      >
        {label}
      </Link>
    </p>
  );
}
