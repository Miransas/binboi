"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Loader2, Lock, Server, Shield, Terminal, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";

// ── utils ─────────────────────────────────────────────────────────────────────

function safeCb(v: string | null | undefined) {
  if (!v) return "/dashboard";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

async function postJson<T = Record<string, unknown>>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
  return data;
}

function pwChecks(pw: string, confirm: string) {
  return [
    { label: "8+ karakter",  ok: pw.length >= 8 },
    { label: "Harf + rakam", ok: /[a-z]/i.test(pw) && /\d/.test(pw) },
    { label: "Eşleşiyor",    ok: confirm.length > 0 && pw === confirm },
  ];
}

// ── left panel components ─────────────────────────────────────────────────────

const FEATURES = [
  { icon: Zap,    label: "Anlık tüneller",    desc: "Tek komutla herhangi bir portu aç" },
  { icon: Globe,  label: "Özel subdomain'ler", desc: "Kendi .miransas.com adresin" },
  { icon: Lock,   label: "Her yerde TLS",      desc: "HTTPS zorunlu, sertifikalar otomatik" },
  { icon: Server, label: "Self-hosted",         desc: "Kendi altyapın, tam kontrol" },
];

function TunnelNode({ icon: Icon, label, sublabel, accent = false }: {
  icon: React.ElementType; label: string; sublabel: string; accent?: boolean;
}) {
  return (
    <div className={cn(
      "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5",
      accent ? "border-[#00ffd1]/20 bg-[#00ffd1]/[0.06]" : "border-white/[0.07] bg-white/[0.025]",
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        accent
          ? "border-[#00ffd1]/25 bg-[#00ffd1]/10 text-[#00ffd1]"
          : "border-white/[0.08] bg-white/[0.04] text-zinc-400",
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={cn("truncate font-mono text-xs font-medium", accent ? "text-[#00ffd1]" : "text-zinc-300")}>
          {label}
        </p>
        <p className="text-[11px] text-zinc-600">{sublabel}</p>
      </div>
    </div>
  );
}

function FlowDot({ color }: { color: string }) {
  return (
    <div className="relative flex w-full items-center justify-center py-0.5">
      <div className="absolute left-1/2 h-full w-px -translate-x-1/2 bg-white/[0.06]" />
      <motion.div
        className={`relative z-10 h-1.5 w-1.5 rounded-full ${color}`}
        animate={{ y: ["-6px", "6px"] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="flex h-full flex-col px-12 py-10">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00ffd1]/20 bg-[#00ffd1]/[0.07]">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#00ffd1]/80">
            <path d="M2 9h14M9 2l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-white/90">Miransas Software</p>
          <p className="text-[10px] text-zinc-600">Binboi tunnel platform</p>
        </div>
      </div>

      {/* Headline */}
      <div className="mt-12">
        <h2 className="text-[2.2rem] font-bold leading-[1.08] tracking-[-0.04em] text-white">
          Her şeyi bağla,
          <br />
          <span className="bg-gradient-to-r from-[#00ffd1] to-[#7aefdc] bg-clip-text text-transparent">
            her yerden.
          </span>
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500">
          Yerel servislerinizi saniyeler içinde internete açın. Self-hosted, TLS güvenceli,
          geliştiriciler için inşa edilmiş.
        </p>
      </div>

      {/* Tunnel demo card */}
      <div className="mt-10 max-w-sm">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060a10] p-5">
          <BorderBeam colorFrom="#00ffd1" colorTo="#9945ff" duration={5} size={110} borderWidth={1.2} />
          <div className="mb-4 flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500/70" />
            <div className="h-2 w-2 rounded-full bg-amber-400/70" />
            <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
            <span className="ml-2 font-mono text-[11px] text-zinc-600">binboi connect 3000</span>
          </div>
          <div className="flex flex-col gap-1">
            <TunnelNode icon={Terminal} label="localhost:3000" sublabel="Your application" />
            <FlowDot color="bg-[#00ffd1]/60" />
            <TunnelNode icon={Shield} label="Binboi gateway" sublabel="Miransas Software" accent />
            <FlowDot color="bg-[#00ffd1]/60" />
            <TunnelNode icon={Globe} label="slug.binboi.miransas.com" sublabel="Public HTTPS endpoint" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-2">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-[11px] text-emerald-300/80">
              Tunnel active · TLS secured · 0ms latency
            </span>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <div className="mt-10 grid gap-3.5">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.03]">
              <Icon className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-300">{label}</span>
              <span className="text-sm text-zinc-600"> — {desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-12">
        <p className="text-xs text-zinc-700">© 2025 Miransas Software. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}

// ── RegisterPage ──────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCb(params.get("callbackUrl"));

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPw]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())          { setError("Adınızı girin."); return; }
    if (!email.trim())         { setError("E-posta adresinizi girin."); return; }
    if (!password)             { setError("Bir şifre oluşturun."); return; }
    if (password !== confirm)  { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await postJson<{ redirectTo?: string }>("/api/auth/register", {
        name,
        email,
        password,
      });
      router.push(data.redirectTo ?? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hesap oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const checks = pwChecks(password, confirm);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left — branding */}
      <div className="relative hidden w-[52%] shrink-0 border-r border-white/[0.06] lg:block">
        <LeftPanel />
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00ffd1]/20 bg-[#00ffd1]/[0.06]">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none" className="text-[#00ffd1]/80">
                <path d="M2 9h14M9 2l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80">Miransas</span>
          </div>
          <div className="hidden lg:block" />
          <Link href="/login" className="text-sm text-zinc-500 transition hover:text-white">
            Zaten hesabın var mı? Giriş yap
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ana sayfaya dön
            </Link>

            <div className="mb-7">
              <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-white">Hesap oluştur</h1>
              <p className="mt-1.5 text-sm text-zinc-500">Ücretsiz başla. Tünellerin, altyapın.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void submit(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Ad Soyad</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sardor Azimov"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00ffd1]/40 focus:bg-white/[0.05]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">E-posta</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siz@sirket.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00ffd1]/40 focus:bg-white/[0.05]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Şifre</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Şifre oluştur"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00ffd1]/40 focus:bg-white/[0.05]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Şifre tekrar</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Şifreni tekrarla"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00ffd1]/40 focus:bg-white/[0.05]"
                />
              </div>

              {password.length > 0 && (
                <div className="flex gap-1.5">
                  {checks.map((c) => (
                    <div
                      key={c.label}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium transition-colors",
                        c.ok
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/[0.07] bg-white/[0.02] text-zinc-600",
                      )}
                    >
                      {c.label}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00ffd1] px-4 py-2.5 text-sm font-semibold text-[#05070b] transition hover:bg-[#33ffda] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hesap oluştur"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Zaten hesabın var mı?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-300 underline underline-offset-4 decoration-white/20 transition hover:text-white hover:decoration-white/50"
              >
                Giriş yap
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
