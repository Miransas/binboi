"use client";

import { ArrowRight } from "lucide-react"

// 1. Local Tunnels Card
export function ShareLocalhostCard() {
  return (
    <div className="relative p-8 md:p-10 rounded-2xl bg-[#060606] border border-white/10 overflow-hidden group hover:border-miransas-cyan/30 transition-colors duration-500 shadow-2xl flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-miransas-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-miransas-cyan font-mono text-xs font-bold tracking-[0.2em] uppercase">Local Introspection</span>
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-miransas-cyan group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-8 text-balance relative z-10">
        Instantly expose<br />localhost to the world.
      </h3>

      <div className="flex justify-center flex-1 items-end relative z-10">
        {/* SVG genişletildi ve responsive yapıldı */}
        <svg width="100%" height="100%" viewBox="0 0 320 340" fill="none" className="max-w-[320px]">
          <defs>
            <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Miransas Hub badge */}
          <g transform="translate(30, 10)">
            <rect x="0" y="0" width="115" height="30" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
            <rect x="10" y="8" width="14" height="14" rx="2" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
            <rect x="14" y="12" width="6" height="6" rx="1" fill="#a855f7" opacity="0.5"/>
            <text x="32" y="20" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Miransas Hub</text>
          </g>

          {/* CI/CD badge */}
          <g transform="translate(170, 10)">
            <rect x="0" y="0" width="115" height="30" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
            <path d="M14 10 L22 18 M22 10 L14 18" stroke="#ff00ff" strokeWidth="1.5" strokeLinecap="round"/>
            <text x="30" y="20" fill="#a1a1aa" fontSize="12" fontFamily="monospace">CI/CD Hooks</text>
          </g>

          {/* Left diagonal line */}
          <path d="M85 40 L85 65 Q85 85 120 100 L160 115" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M85 40 L85 65 Q85 85 120 100 L160 115" stroke="#00ffd1" strokeWidth="2.5" strokeDasharray="8 8" fill="none">
            <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.8s" repeatCount="indefinite"/>
          </path>
          
          {/* Flowing particle */}
          <circle r="4.5" fill="#00ffd1" filter="url(#glowCyan)">
            <animateMotion dur="1.2s" repeatCount="indefinite">
              <mpath href="#leftPath1"/>
            </animateMotion>
          </circle>
          <path id="leftPath1" d="M85 40 L85 65 Q85 85 120 100 L160 115" fill="none"/>

          {/* Right diagonal line */}
          <path d="M230 40 L230 65 Q230 85 190 100 L160 115" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M230 40 L230 65 Q230 85 190 100 L160 115" stroke="#ff00ff" strokeWidth="2.5" strokeDasharray="8 8" fill="none">
            <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.8s" repeatCount="indefinite" begin="0.4s"/>
          </path>
          
          <circle r="4.5" fill="#ff00ff" filter="url(#glowCyan)">
            <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.4s">
              <mpath href="#rightPath1"/>
            </animateMotion>
          </circle>
          <path id="rightPath1" d="M230 40 L230 65 Q230 85 190 100 L160 115" fill="none"/>

          {/* Core Node Logo (Binboi) */}
          <circle cx="160" cy="160" r="48" fill="#0a0a0a" stroke="#00ffd1" strokeWidth="1" strokeOpacity="0.4"/>
          <circle cx="160" cy="160" r="48" fill="none" stroke="#00ffd1" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="48;65;48" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
          </circle>
          {/* Binboi "B" Harfi */}
          <text x="160" y="180" textAnchor="middle" fill="#fff" fontSize="55" fontStyle="italic" fontWeight="900" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,209,0.5))' }}>B</text>

          {/* Line from Core to Shield */}
          <path d="M160 208 L160 235" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M160 208 L160 235" stroke="#00ffd1" strokeWidth="2.5" strokeDasharray="6 6" fill="none">
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.6s" repeatCount="indefinite"/>
          </path>
          <circle r="4" fill="#00ffd1" filter="url(#glowCyan)">
            <animateMotion dur="0.6s" repeatCount="indefinite">
              <mpath href="#toShield"/>
            </animateMotion>
          </circle>
          <path id="toShield" d="M160 208 L160 235" fill="none"/>

          {/* Shield/WAF badge */}
          <g transform="translate(125, 235)">
            <rect x="0" y="0" width="70" height="28" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
            <text x="35" y="18" textAnchor="middle" fill="#00ffd1" fontSize="11" fontFamily="monospace" fontWeight="bold">NAT Bypass</text>
          </g>

          {/* Line from Shield to Localhost */}
          <path d="M160 263 L160 290" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M160 263 L160 290" stroke="#00ffd1" strokeWidth="2.5" strokeDasharray="6 6" fill="none">
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.6s" repeatCount="indefinite" begin="0.3s"/>
          </path>
          <circle r="4" fill="#00ffd1" filter="url(#glowCyan)">
            <animateMotion dur="0.6s" repeatCount="indefinite" begin="0.3s">
              <mpath href="#toLocal"/>
            </animateMotion>
          </circle>
          <path id="toLocal" d="M160 263 L160 290" fill="none"/>

          {/* Localhost Machine */}
          <g transform="translate(85, 290)">
            <rect x="0" y="0" width="150" height="45" rx="8" fill="#111" stroke="#333" strokeWidth="1"/>
            <circle cx="20" cy="22" r="4" fill="#00ffd1">
              <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            <text x="35" y="27" fill="#d4d4d8" fontSize="14" fontFamily="monospace">localhost:3000</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

// 2. L7 Gateway Card
export function ApiGatewayCard() {
  return (
    <div className="relative p-8 md:p-10 rounded-2xl bg-[#060606] border border-white/10 overflow-hidden group hover:border-miransas-magenta/30 transition-colors duration-500 shadow-2xl flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-miransas-magenta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-miransas-magenta font-mono text-xs font-bold tracking-[0.2em] uppercase">L7 NEURAL GATEWAY</span>
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-miransas-magenta group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-8 text-balance relative z-10">
        Route and secure<br />your microservices.
      </h3>

      <div className="flex justify-center flex-1 items-end relative z-10">
        <svg width="100%" height="100%" viewBox="0 0 360 380" fill="none" className="max-w-[360px]">
          <defs>
            <filter id="glowMag" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Global Requests badge */}
          <g transform="translate(115, 0)">
            <rect x="0" y="0" width="130" height="30" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
            <text x="65" y="20" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Global Requests</text>
          </g>

          {/* Line to core */}
          <path d="M180 30 L180 80" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M180 30 L180 80" stroke="#ff00ff" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.7s" repeatCount="indefinite"/>
          </path>
          
          <circle r="4.5" fill="#ff00ff" filter="url(#glowMag)">
            <animateMotion dur="0.8s" repeatCount="indefinite">
              <mpath href="#toLogoApi"/>
            </animateMotion>
          </circle>
          <path id="toLogoApi" d="M180 30 L180 80" fill="none"/>

          {/* Central logo */}
          <circle cx="180" cy="130" r="48" fill="#0a0a0a" stroke="#ff00ff" strokeWidth="1" strokeOpacity="0.4"/>
          <circle cx="180" cy="130" r="48" fill="none" stroke="#ff00ff" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="48;65;48" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text x="180" y="150" textAnchor="middle" fill="#fff" fontSize="55" fontStyle="italic" fontWeight="900" style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,255,0.5))' }}>B</text>

          {/* WAF & Limits */}
          <g transform="translate(250, 90)">
            <rect x="0" y="0" width="16" height="16" rx="2" fill="none" stroke="#ff00ff" strokeWidth="1.5"/>
            <text x="26" y="12" fill="#a1a1aa" fontSize="12" fontFamily="monospace">WAF Shield</text>
            
            <g transform="translate(0, 30)">
              <circle cx="8" cy="8" r="7" fill="none" stroke="#ff00ff" strokeWidth="1.5"/>
              <line x1="8" y1="4" x2="8" y2="8" stroke="#ff00ff" strokeWidth="1.5"/>
              <text x="26" y="12" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Smart Limiter</text>
            </g>
          </g>

          {/* Routing Branches */}
          <path d="M150 175 L150 200 Q150 215 110 225 L90 230" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M150 175 L150 200 Q150 215 110 225 L90 230" stroke="#00ffd1" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" begin="0.2s"/>
          </path>
          <circle r="4" fill="#00ffd1" filter="url(#glowMag)">
            <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.2s"><mpath href="#leftBranch"/></animateMotion>
          </circle>
          <path id="leftBranch" d="M150 175 L150 200 Q150 215 110 225 L90 230" fill="none"/>

          <path d="M210 175 L210 200 Q210 215 250 225 L270 230" stroke="#222" strokeWidth="2" fill="none"/>
          <path d="M210 175 L210 200 Q210 215 250 225 L270 230" stroke="#ff00ff" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" begin="0.5s"/>
          </path>
          <circle r="4" fill="#ff00ff" filter="url(#glowMag)">
            <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.5s"><mpath href="#rightBranch"/></animateMotion>
          </circle>
          <path id="rightBranch" d="M210 175 L210 200 Q210 215 250 225 L270 230" fill="none"/>

          {/* Endpoints */}
          <g transform="translate(30, 230)">
            <rect x="0" y="0" width="100" height="28" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
            <text x="50" y="18" textAnchor="middle" fill="#00ffd1" fontSize="11" fontFamily="monospace">/api/core</text>
          </g>
          <g transform="translate(220, 230)">
            <rect x="0" y="0" width="100" height="28" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
            <text x="50" y="18" textAnchor="middle" fill="#ff00ff" fontSize="11" fontFamily="monospace">/api/data</text>
          </g>

          <path d="M80 258 L80 285" stroke="#00ffd1" strokeWidth="2.5" strokeDasharray="6 4" fill="none">
             <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M270 258 L270 285" stroke="#ff00ff" strokeWidth="2.5" strokeDasharray="6 4" fill="none">
             <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite"/>
          </path>

          {/* Core Services */}
          <g transform="translate(15, 285)">
            <rect x="0" y="0" width="130" height="50" rx="8" fill="#111" stroke="#00ffd140" strokeWidth="1"/>
            <text x="65" y="30" textAnchor="middle" fill="#d4d4d8" fontSize="13" fontFamily="system-ui">Core Service</text>
          </g>
          <g transform="translate(205, 285)">
            <rect x="0" y="0" width="130" height="50" rx="8" fill="#111" stroke="#ff00ff40" strokeWidth="1"/>
            <text x="65" y="30" textAnchor="middle" fill="#d4d4d8" fontSize="13" fontFamily="system-ui">Data Service</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

// 3. AI Proxy Gateway Card
export function AiGatewayCard() {
  return (
    <div className="relative p-8 md:p-12 rounded-2xl bg-[#060606] border border-white/10 overflow-hidden group hover:border-purple-500/30 transition-colors duration-500 shadow-2xl mt-6">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-purple-400 font-mono text-xs font-bold tracking-[0.2em] uppercase">AI PROXY GATEWAY</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
        <div className="lg:w-2/5">
          <h3 className="text-3xl md:text-5xl font-black italic tracking-tight text-white mb-6 text-balance">
            Load-balance across global AI nodes.
          </h3>
          <p className="text-gray-500 text-lg">Route, cache, and secure your LLM inference calls through Miransas neural networks.</p>
        </div>

        <div className="lg:w-3/5 w-full flex justify-center">
          <svg width="100%" height="100%" viewBox="0 0 420 320" fill="none" className="max-w-[420px]">
            <defs>
              <filter id="glowPurp" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Input Badge */}
            <g transform="translate(135, 0)">
              <rect x="0" y="0" width="150" height="30" rx="6" fill="#111" stroke="#333" strokeWidth="1"/>
              <text x="75" y="20" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">AI API Requests</text>
            </g>

            {/* Main trunk */}
            <path d="M210 30 L210 80" stroke="#222" strokeWidth="2" fill="none"/>
            <path d="M210 30 L210 80" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
              <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.6s" repeatCount="indefinite"/>
            </path>
            <circle r="4.5" fill="#a855f7" filter="url(#glowPurp)">
              <animateMotion dur="0.8s" repeatCount="indefinite"><mpath href="#toAiLogo"/></animateMotion>
            </circle>
            <path id="toAiLogo" d="M210 30 L210 80" fill="none"/>

            {/* Central Hub */}
            <circle cx="210" cy="130" r="48" fill="#0a0a0a" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.4"/>
            <circle cx="210" cy="130" r="55" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 8" opacity="0.5">
              <animateTransform attributeName="transform" type="rotate" from="0 210 130" to="360 210 130" dur="15s" repeatCount="indefinite"/>
            </circle>
            <text x="210" y="150" textAnchor="middle" fill="#fff" fontSize="55" fontStyle="italic" fontWeight="900" style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' }}>B</text>

            {/* Side Features */}
            <g transform="translate(10, 95)">
              <text x="100" y="12" textAnchor="end" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Token Limiting</text>
              <text x="100" y="42" textAnchor="end" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Bearer Auth</text>
            </g>
            <g transform="translate(290, 95)">
              <text x="10" y="12" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Semantic Cache</text>
              <text x="10" y="42" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Live Analytics</text>
            </g>

            {/* Branches to LLMs */}
            <path d="M175 170 L175 200 Q175 215 130 225 L95 235" stroke="#222" strokeWidth="2" fill="none"/>
            <path d="M175 170 L175 200 Q175 215 130 225 L95 235" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
              <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" begin="0.2s"/>
            </path>
            
            <path d="M210 180 L210 235" stroke="#222" strokeWidth="2" fill="none"/>
            <path d="M210 180 L210 235" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
              <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" begin="0.4s"/>
            </path>

            <path d="M245 170 L245 200 Q245 215 290 225 L325 235" stroke="#222" strokeWidth="2" fill="none"/>
            <path d="M245 170 L245 200 Q245 215 290 225 L325 235" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="8 6" fill="none">
              <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" begin="0.6s"/>
            </path>

            {/* LLM Nodes */}
            <g transform="translate(35, 235)">
              <rect x="0" y="0" width="100" height="45" rx="8" fill="#111" stroke="#a855f740" strokeWidth="1"/>
              <text x="50" y="27" textAnchor="middle" fill="#a855f7" fontSize="13" fontFamily="monospace" fontWeight="bold">LLM Node 1</text>
            </g>
            <g transform="translate(160, 235)">
              <rect x="0" y="0" width="100" height="45" rx="8" fill="#111" stroke="#a855f740" strokeWidth="1"/>
              <text x="50" y="27" textAnchor="middle" fill="#a855f7" fontSize="13" fontFamily="monospace" fontWeight="bold">LLM Node 2</text>
            </g>
            <g transform="translate(285, 235)">
              <rect x="0" y="0" width="100" height="45" rx="8" fill="#111" stroke="#a855f740" strokeWidth="1"/>
              <text x="50" y="27" textAnchor="middle" fill="#a855f7" fontSize="13" fontFamily="monospace" fontWeight="bold">LLM Node 3</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

// 4. Main Wrapper
export function FeatureCards() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12 bg-[#060606]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShareLocalhostCard />
        <ApiGatewayCard />
      </div>
      <AiGatewayCard />
    </section>
  )
}