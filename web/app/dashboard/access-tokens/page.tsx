/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Check, 
  Copy, 
  KeyRound, 
  Plus, 
  RefreshCcw, 
  Trash2,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

// --- Types ---
type AccessTokenRecord = {
  id: string;
  name: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type AccessTokenResponse = {
  auth_mode: "account" | "preview";
  user: { id: string; name: string; email: string; plan: "FREE" | "PRO" | "SCALE"; };
  limits: { plan: "FREE" | "PRO" | "SCALE"; max_tokens: number; max_tunnels: number; tokens_used: number; active_tunnels: number | null; };
  tokens: AccessTokenRecord[];
};

type AccessTokenCreateResponse = AccessTokenResponse & { token: string; record: AccessTokenRecord; };

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AccessTokensPage() {
  const [data, setData] = useState<AccessTokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("CLI token");
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<AccessTokenCreateResponse | null>(null);

  const load = async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/v1/tokens", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Load failed");
      setData(body);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createToken = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Create failed");
      setNewToken(body);
      setData(body);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (!window.confirm("Revoke this token?")) return;
    try {
      const response = await fetch(`/api/v1/tokens/${tokenId}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Revoke failed");
      setData(body);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyText = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopyState(key);
    setTimeout(() => setCopyState(null), 2000);
  };

  return (
    <motion.main 
      initial="hidden" animate="visible" variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.section variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 mb-6">
            <ShieldCheck className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Security & Auth</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Access Tokens</h1>
          <p className="mt-4 text-zinc-500 max-w-2xl text-lg leading-relaxed">
            Create personal access tokens for <code className="text-zinc-300">binboi login</code>. We store only hashes; full tokens are shown only once.
          </p>
        </motion.section>

        {/* Highlights */}
        <motion.section variants={itemVariants} className="grid gap-4 md:grid-cols-3 mb-12">
          {[
            { label: "Current Plan", value: data?.limits.plan || "...", icon: Zap, color: "text-amber-400" },
            { label: "Token Usage", value: `${data?.limits.tokens_used || 0} / ${data?.limits.max_tokens || 0}`, icon: KeyRound, color: "text-cyan-400" },
            { label: "Active Tunnels", value: `${data?.limits.active_tunnels || 0} / ${data?.limits.max_tunnels || 0}`, icon: Activity, color: "text-emerald-400" }
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{item.value}</div>
            </div>
          ))}
        </motion.section>

        <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
          {/* Left: Create Token Form */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Plus className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Generate Token</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Token Identifier</label>
                  <input 
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="mt-2 w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="e.g. Production-MacBook"
                  />
                </div>

                <button 
                  onClick={createToken}
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  {creating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {data?.auth_mode === "preview" ? "Rotate Preview Token" : "Create Access Token"}
                </button>
              </div>

              {/* Warning Box */}
              <div className="mt-8 p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 flex gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  Tokens are only visible at creation. Losing it requires generating a new one and updating your CLI config.
                </p>
              </div>

              {/* New Token Display */}
              <AnimatePresence>
                {newToken && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    className="mt-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Secret Token Generated</span>
                      <button onClick={() => copyText(newToken.token, "new-token")} className="text-emerald-400 hover:text-emerald-300">
                        {copyState === "new-token" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <code className="block text-xs font-mono text-white break-all bg-black/40 p-3 rounded-lg border border-white/5">
                      {newToken.token}
                    </code>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Right: Existing Tokens Table */}
          <motion.section variants={itemVariants} className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-5 bg-white/[0.02]">
               <h2 className="text-sm font-bold uppercase tracking-widest text-white">Active Credentials</h2>
               <button onClick={() => load(true)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <RefreshCcw className={`h-4 w-4 text-zinc-500 ${refreshing ? 'animate-spin' : ''}`} />
               </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <th className="px-8 py-4">Name / ID</th>
                    <th className="px-8 py-4">Prefix</th>
                    <th className="px-8 py-4">Last Used</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-sm text-zinc-600 animate-pulse">Establishing connection to control plane...</td></tr>
                  ) : !data || data.tokens.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-sm text-zinc-600 font-mono">NO ACTIVE TOKENS FOUND</td></tr>
                  ) : (
                    data.tokens.map((token) => (
                      <tr key={token.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-white text-sm">{token.name}</div>
                          <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tight">{token.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-8 py-5 font-mono text-xs text-cyan-400/80">{token.prefix}...</td>
                        <td className="px-8 py-5">
                          <div className="text-xs text-zinc-400">{formatDate(token.lastUsedAt)}</div>
                          <div className="text-[9px] text-zinc-600 mt-1 uppercase">Created: {formatDate(token.createdAt)}</div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => revokeToken(token.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Revoke Token"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.main>
  );
}