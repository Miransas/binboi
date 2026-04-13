// app/terms/page.tsx
import React from 'react';
import { Footer } from '../../../components/site/shared/footer';

export default function TermsOfService() {
  const lastUpdated = "April 14, 2026";

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-mono p-8 md:p-24 selection:bg-cyan-500/30 w-full">
      <div className="max-w-3xl mx-auto border border-zinc-800 bg-zinc-950/50 p-8 rounded-lg shadow-[0_0_50px_-12px_rgba(6,182,212,0.1)]">
        
        {/* Header Section */}
        <header className="mb-12 border-b border-zinc-800 pb-8 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-2 italic">
            TERMS_OF_SERVICE
          </h1>
          <p className="text-cyan-500 text-sm tracking-widest uppercase font-semibold">
            Project: binboi // binboi.com
          </p>
          <p className="text-xs text-zinc-500 mt-4 italic">
            Last Updated: {lastUpdated}
          </p>
        </header>

        {/* Content Section */}
        <div className="space-y-12 leading-relaxed">
          
          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center">
              <span className="text-cyan-500 mr-2">01.</span> THE_PROTOCOL
            </h2>
            <p>
              By accessing <span className="text-zinc-200 underline decoration-cyan-500/50">binboi.com</span>, 
              you enter into a binding agreement with **Miransas**. This is a self-hosted tunneling 
              infrastructure. Use it for development, testing, and being a god-tier engineer.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center">
              <span className="text-cyan-500 mr-2">02.</span> USER_CONDUCT
            </h2>
            <p className="mb-4">You agree not to use binboi for:</p>
            <ul className="list-none space-y-2 pl-4 border-l border-cyan-500/30">
              <li>{">"} Illegal data exfiltration</li>
              <li>{">"} Botnet command and control centers</li>
              <li>{">"} Distributing malicious scripts or payloads</li>
              <li>{">"} Bypassing firewalls for unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center">
              <span className="text-cyan-500 mr-2">03.</span> LIABILITY_NULL
            </h2>
            <p className="italic">
              &ldquo;We build the tunnels, you drive the trucks.&ldquo;
            </p>
            <p className="mt-2">
              **Miransoft** is not responsible for any data loss, server downtime, or 
              security breaches caused by improper tunnel configuration. The software is 
              provided &#34;AS IS&#34;, without warranty of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-bold mb-4 flex items-center">
              <span className="text-cyan-500 mr-2">04.</span> API_TERMINATION
            </h2>
            <p>
              We reserve the right to revoke API keys or terminate tunnel access if we detect 
              activity that threatens the integrity of the binboi network. Play fair, stay secure.
            </p>
          </section>

        </div>

        {/* Footer Section */}
        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
          &copy; 2026 Miransas // All Rights Reserved // Secure Tunneling Protocol
        </footer>
      </div>
      <div>

      </div>
     
    </div>
  );
}