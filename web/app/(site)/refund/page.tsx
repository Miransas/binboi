"use client";

import React from "react";


const refundSections = [
  {
    title: "Digital Nature of Service",
    body: [
      "Binboi provide digital infrastructure and tunneling services. Due to the nature of digital products, once the service is activated and the tunnel is established, we generally do not offer refunds.",
      "By upgrading to a Pro plan, you acknowledge that you are gaining immediate access to premium relay servers and dedicated subdomains.",
    ],
  },
  {
    title: "All Sales Are Final",
    body: [
      "Except as required by law (such as European Union consumer protection laws), all subscription payments are non-refundable.",
      "If you cancel your subscription, you will continue to have access to the premium features until the end of your current billing cycle, but no partial refunds will be issued for remaining days.",
    ],
  },
  {
    title: "Technical Exceptions",
    body: [
      "We want you to be happy with the tunnels. If Binboi fails to perform its core function (e.g., our relay servers are down for an extended period) and our support team cannot fix the issue within 7 days, we may consider a pro-rated refund at our sole discretion.",
      "Refund requests based on 'I don't need it anymore' or 'I forgot to cancel' are not typically granted.",
    ],
  },
  {
    title: "How to Request",
    body: [
      "If you believe you have a valid case for a refund due to a technical failure, please contact us at support@miransas.com with your account details and a description of the technical blocker.",
      "Refund requests must be made within 14 days of the original transaction date.",
    ],
  },
];

export default function RefundPage() {
  return (
    <div className="relative min-h-screen bg-black text-zinc-300 selection:bg-[#9eff00]/30 selection:text-[#9eff00] flex flex-col">
      {/* Background Terminal Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#f43f5e]/5 blur-[100px] pointer-events-none rounded-full z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex-grow pt-32 pb-24 px-6 md:px-12">
        
        {/* Header Section */}
        <header className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f43f5e]/30 bg-[#f43f5e]/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#f43f5e] shadow-[0_0_15px_rgba(244,63,94,0.1)] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e] animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            Protocol: Refund
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            Refund Policy
          </h1>
          
          <p className="mx-auto font-mono text-xs md:text-sm leading-relaxed text-zinc-400">
            We build high-performance tunnels. This policy outlines when and how we handle payment reversals, ensuring a fair balance between our operational costs and your satisfaction.
          </p>
        </header>

        {/* Content Sections */}
        <div className="mx-auto max-w-3xl space-y-6">
          {refundSections.map((section, index) => (
            <div 
              key={section.title} 
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#050505]/80 backdrop-blur-md p-8 transition-all duration-500 hover:border-[#f43f5e]/30"
            >
              <div className="relative z-10 flex items-center gap-4 mb-6 border-b border-zinc-800/50 pb-4">
                <span className="font-mono text-sm text-zinc-600 transition-colors duration-500 group-hover:text-[#f43f5e]">
                  0{index + 1}.
                </span>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>
              
              <div className="relative z-10 space-y-4 font-mono text-[11px] md:text-xs leading-relaxed text-zinc-400">
                {section.body.map((paragraph, pIndex) => (
                  <p key={pIndex} className="flex gap-3">
                    <span className="text-[#f43f5e]/40 select-none">{"//"}</span>
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