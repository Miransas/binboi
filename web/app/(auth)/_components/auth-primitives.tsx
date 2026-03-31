import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const authInputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-miransas-cyan/35 focus:bg-white/[0.05]";

export const authPrimaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-2xl bg-miransas-cyan px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70";

export const authSecondaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70";

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
        "relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.94),rgba(5,9,18,0.985))] p-6 shadow-[0_40px_130px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(134,169,255,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="relative z-10">{children}</div>
    </section>
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(194,203,219,0.78)] sm:text-base">
        {description}
      </p>
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

  return <div className={`rounded-[1.5rem] border px-4 py-3 text-sm leading-7 ${classes}`}>{children}</div>;
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
