"use client";

import React from "react";


const privacySections = [
  {
    title: "What Binboi collects",
    body: [
      "Binboi may collect account information such as name, email address, avatar, and sign-in metadata when authentication providers are enabled.",
      "The product also stores access-token metadata such as token name, prefix, creation time, last-used time, revocation state, and a secure hash of the token. Raw token values are not stored after creation.",
      "For operating the tunnel platform, Binboi may process tunnel metadata, request counts, byte counts, event logs, IP information, and webhook or request metadata that passes through the relay.",
    ],
  },
  {
    title: "How Binboi uses data",
    body: [
      "We use data to operate the control plane, authenticate CLI sessions, maintain audit trails, prevent abuse, debug failures, and improve the reliability of the product.",
      "If you enable AI-assisted search or summaries, the assistant uses server-side context and optional environment-configured model access to answer product questions. Secrets are not intended to be sent to the client browser.",
    ],
  },
  {
    title: "Traffic and sensitive data",
    body: [
      "Binboi is built for developer workflows, not for silently processing unlimited sensitive production traffic.",
      "Operators should avoid tunneling highly regulated or internal-only systems through public URLs unless they control the deployment, logging, domain, and security boundaries.",
      "Where request or webhook inspection exists, it should be treated as operational tooling. Keep payload retention narrow and avoid sending secrets that do not need to traverse the tunnel.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "Account records, token metadata, and event logs may be retained for operational, security, and audit purposes for as long as reasonably necessary.",
      "Where practical, operators can revoke tokens, delete local data stores, or remove self-hosted infrastructure to limit retained information.",
    ],
  },
  {
    title: "Security posture",
    body: [
      "Binboi stores access tokens as hashes plus prefixes, uses revocation states, and aims to keep operational credentials separate from dashboard account access.",
      "No software system is perfectly secure, especially in early-stage infrastructure products. Operators remain responsible for deployment choices, network exposure, firewall rules, and edge TLS.",
    ],
  },
  {
    title: "Contact and updates",
    body: [
      "If you have privacy questions, requests, or concerns, contact the project operator through the repository or the company channels referenced on the Binboi website.",
      "This privacy policy may evolve as Binboi adds managed infrastructure, billing, more formal data processing relationships, or broader team features.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-black text-zinc-300 selection:bg-[#9eff00]/30 selection:text-[#9eff00] flex flex-col">
      {/* Background Terminal Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#9eff00]/5 blur-[100px] pointer-events-none rounded-full z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex-grow pt-32 pb-24 px-6 md:px-12">
        
        {/* Header Section */}
        <header className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00ffd1]/30 bg-[#00ffd1]/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#00ffd1] shadow-[0_0_15px_rgba(0,255,209,0.1)] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ffd1] animate-pulse shadow-[0_0_8px_rgba(0,255,209,0.8)]" />
            Legal Protocol
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Privacy Policy
          </h1>
          
          <p className="mx-auto font-mono text-xs md:text-sm leading-relaxed text-zinc-400">
            This policy explains the narrow, practical privacy posture behind Binboi today: account access, token metadata, relay events, and request visibility needed to operate the product without pretending it is already a mature global edge network.
          </p>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-800/80 bg-black/50 backdrop-blur-sm">
              <span className="text-zinc-600">Last updated:</span>
              <span className="text-[#9eff00]">March 30, 2026</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-800/80 bg-black/50 backdrop-blur-sm">
              <span className="text-zinc-600">Status:</span>
              <span className="text-[#00ffd1]">Early-Stage SaaS</span>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="mx-auto max-w-3xl space-y-6">
          {privacySections.map((section, index) => (
            <div 
              key={section.title} 
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#050505]/80 backdrop-blur-md p-8 transition-all duration-500 hover:border-[#9eff00]/30 hover:shadow-[0_8px_30px_rgba(158,255,0,0.05)]"
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#9eff00]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4 mb-6 border-b border-zinc-800/50 pb-4">
                <span className="font-mono text-sm text-zinc-600 transition-colors duration-500 group-hover:text-[#9eff00]">
                  0{index + 1}.
                </span>
                <h2 className="text-xl font-bold text-white transition-colors duration-500 group-hover:text-white">
                  {section.title}
                </h2>
              </div>
              
              <div className="relative z-10 space-y-4 font-mono text-[11px] md:text-xs leading-relaxed text-zinc-400">
                {section.body.map((paragraph, pIndex) => (
                  <p key={pIndex} className="flex gap-3">
                    <span className="text-[#00ffd1]/40 select-none">{">"}</span>
                    <span>{paragraph}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

    
    </div>
  );
}