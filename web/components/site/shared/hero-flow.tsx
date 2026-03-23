"use client"

import { ArrowRight } from "lucide-react"

// Share Localhost Card with flowing particles
export function ShareLocalhostCard() {
  return (
    <div className="relative p-8 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group hover:border-emerald-500/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-emerald-400 font-mono text-sm tracking-wider">SHARE LOCALHOST</span>
        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
      </div>

      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8 text-balance">
        Put your local app<br />on a public URL
      </h3>

      <div className="flex justify-center">
        <svg width="300" height="340" viewBox="0 0 300 340" fill="none">
          <defs>
            {/* Glow filter */}
            <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Particle gradient */}
            <radialGradient id="particleGrad1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="1"/>
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Collaborators badge */}
          <g transform="translate(40, 10)">
            <rect x="0" y="0" width="105" height="30" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <rect x="10" y="8" width="14" height="14" rx="2" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
            <rect x="14" y="12" width="6" height="6" rx="1" fill="#a855f7" opacity="0.5"/>
            <text x="32" y="20" fill="#d4d4d8" fontSize="12" fontFamily="monospace">Collaborators</text>
          </g>

          {/* Webhooks badge */}
          <g transform="translate(160, 10)">
            <rect x="0" y="0" width="95" height="30" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <path d="M14 10 L22 18 M22 10 L14 18" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
            <text x="30" y="20" fill="#d4d4d8" fontSize="12" fontFamily="monospace">Webhooks</text>
          </g>

          {/* Left diagonal line */}
          <path 
            d="M92 40 L92 65 Q92 85 120 100 L150 115" 
            stroke="#3f3f46" 
            strokeWidth="1.5" 
            fill="none"
          />
          <path 
            d="M92 40 L92 65 Q92 85 120 100 L150 115" 
            stroke="#4ade80" 
            strokeWidth="2" 
            strokeDasharray="8 6"
            fill="none"
          >
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite"/>
          </path>
          
          {/* Flowing particle on left line */}
          <circle r="4" fill="#4ade80" filter="url(#glow1)">
            <animateMotion dur="1.5s" repeatCount="indefinite">
              <mpath href="#leftPath1"/>
            </animateMotion>
          </circle>
          <path id="leftPath1" d="M92 40 L92 65 Q92 85 120 100 L150 115" fill="none"/>

          {/* Right diagonal line */}
          <path 
            d="M208 40 L208 65 Q208 85 180 100 L150 115" 
            stroke="#3f3f46" 
            strokeWidth="1.5" 
            fill="none"
          />
          <path 
            d="M208 40 L208 65 Q208 85 180 100 L150 115" 
            stroke="#4ade80" 
            strokeWidth="2" 
            strokeDasharray="8 6"
            fill="none"
          >
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" begin="0.5s"/>
          </path>
          
          {/* Flowing particle on right line */}
          <circle r="4" fill="#4ade80" filter="url(#glow1)">
            <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.5s">
              <mpath href="#rightPath1"/>
            </animateMotion>
          </circle>
          <path id="rightPath1" d="M208 40 L208 65 Q208 85 180 100 L150 115" fill="none"/>

          {/* Central logo with pulse */}
          <circle cx="150" cy="155" r="42" fill="#052e16" stroke="#4ade8060" strokeWidth="1.5"/>
          <circle cx="150" cy="155" r="42" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="42;52;42" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text x="150" y="172" textAnchor="middle" fill="#4ade80" fontSize="40" fontWeight="bold" fontFamily="system-ui">n</text>

          {/* Line from logo to NAT */}
          <path d="M150 197 L150 225" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M150 197 L150 225" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <circle r="3" fill="#4ade80" filter="url(#glow1)">
            <animateMotion dur="0.8s" repeatCount="indefinite">
              <mpath href="#toNat"/>
            </animateMotion>
          </circle>
          <path id="toNat" d="M150 197 L150 225" fill="none"/>

          {/* NAT badge */}
          <g transform="translate(115, 225)">
            <rect x="0" y="0" width="70" height="30" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <text x="35" y="20" textAnchor="middle" fill="#d4d4d8" fontSize="13" fontFamily="monospace">NAT</text>
          </g>

          {/* Line from NAT to Localhost */}
          <path d="M150 255 L150 285" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M150 255 L150 285" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
          </path>
          <circle r="3" fill="#4ade80" filter="url(#glow1)">
            <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.3s">
              <mpath href="#toLocal"/>
            </animateMotion>
          </circle>
          <path id="toLocal" d="M150 255 L150 285" fill="none"/>

          {/* Localhost box */}
          <g transform="translate(75, 285)">
            <rect x="0" y="0" width="150" height="50" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <rect x="60" y="10" width="30" height="18" rx="3" fill="none" stroke="#71717a" strokeWidth="1.5"/>
            <line x1="60" y1="24" x2="90" y2="24" stroke="#71717a" strokeWidth="1"/>
            <circle cx="75" cy="17" r="2" fill="#4ade80">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <text x="75" y="42" textAnchor="middle" fill="#d4d4d8" fontSize="13" fontFamily="system-ui">Localhost</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

// API Gateway Card
export function ApiGatewayCard() {
  return (
    <div className="relative p-8 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group hover:border-emerald-500/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-emerald-400 font-mono text-sm tracking-wider">API GATEWAY</span>
        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
      </div>

      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 text-balance">
        Deliver and secure APIs
      </h3>

      <div className="flex justify-center">
        <svg width="340" height="380" viewBox="0 0 340 380" fill="none">
          <defs>
            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Customer traffic badge */}
          <g transform="translate(105, 0)">
            <rect x="0" y="0" width="130" height="30" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <text x="65" y="20" textAnchor="middle" fill="#d4d4d8" fontSize="12" fontFamily="monospace">Customer traffic</text>
          </g>

          {/* Line to central logo */}
          <path d="M170 30 L170 70" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M170 30 L170 70" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite"/>
          </path>
          
          {/* Multiple flowing particles */}
          <circle r="4" fill="#4ade80" filter="url(#glow2)">
            <animateMotion dur="1s" repeatCount="indefinite">
              <mpath href="#toLogoApi"/>
            </animateMotion>
          </circle>
          <circle r="3" fill="#22c55e" filter="url(#glow2)">
            <animateMotion dur="1s" repeatCount="indefinite" begin="0.5s">
              <mpath href="#toLogoApi"/>
            </animateMotion>
          </circle>
          <path id="toLogoApi" d="M170 30 L170 70" fill="none"/>

          {/* Central logo with pulse */}
          <circle cx="170" cy="115" r="42" fill="#052e16" stroke="#4ade8060" strokeWidth="1.5"/>
          <circle cx="170" cy="115" r="42" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="42;55;42" dur="2.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <text x="170" y="132" textAnchor="middle" fill="#4ade80" fontSize="40" fontWeight="bold" fontFamily="system-ui">n</text>

          {/* Features on the right with animated icons */}
          <g transform="translate(230, 80)">
            {/* WAF */}
            <g>
              <rect x="0" y="0" width="16" height="16" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5">
                <animate attributeName="stroke-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
              </rect>
              <line x1="4" y1="5" x2="12" y2="5" stroke="#4ade80" strokeWidth="1"/>
              <line x1="4" y1="8" x2="12" y2="8" stroke="#4ade80" strokeWidth="1"/>
              <line x1="4" y1="11" x2="12" y2="11" stroke="#4ade80" strokeWidth="1"/>
              <text x="24" y="12" fill="#a1a1aa" fontSize="13" fontFamily="monospace">WAF</text>
            </g>
            {/* DDoS */}
            <g transform="translate(0, 28)">
              <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="#4ade80" strokeWidth="1.5">
                <animate attributeName="stroke" values="#4ade80;#22c55e;#4ade80" dur="1.5s" repeatCount="indefinite"/>
              </path>
              <text x="24" y="12" fill="#a1a1aa" fontSize="13" fontFamily="monospace">DDoS protection</text>
            </g>
            {/* Rate limiting */}
            <g transform="translate(0, 56)">
              <circle cx="8" cy="8" r="7" fill="none" stroke="#4ade80" strokeWidth="1.5"/>
              <line x1="8" y1="4" x2="8" y2="8" stroke="#4ade80" strokeWidth="1.5">
                <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="4s" repeatCount="indefinite"/>
              </line>
              <line x1="8" y1="8" x2="12" y2="10" stroke="#4ade80" strokeWidth="1.5">
                <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="8s" repeatCount="indefinite"/>
              </line>
              <text x="24" y="12" fill="#a1a1aa" fontSize="13" fontFamily="monospace">Rate limiting</text>
            </g>
          </g>

          {/* Branching lines */}
          <path id="leftBranch" d="M145 157 L145 185 Q145 200 110 210 L85 220" fill="none"/>
          <path d="M145 157 L145 185 Q145 200 110 210 L85 220" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M145 157 L145 185 Q145 200 110 210 L85 220" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.2s"/>
          </path>
          <circle r="4" fill="#4ade80" filter="url(#glow2)">
            <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.2s">
              <mpath href="#leftBranch"/>
            </animateMotion>
          </circle>

          <path id="rightBranch" d="M195 157 L195 185 Q195 200 230 210 L255 220" fill="none"/>
          <path d="M195 157 L195 185 Q195 200 230 210 L255 220" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M195 157 L195 185 Q195 200 230 210 L255 220" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.4s"/>
          </path>
          <circle r="4" fill="#4ade80" filter="url(#glow2)">
            <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.4s">
              <mpath href="#rightBranch"/>
            </animateMotion>
          </circle>

          {/* API endpoints */}
          <g transform="translate(30, 220)">
            <rect x="0" y="0" width="100" height="28" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <text x="50" y="18" textAnchor="middle" fill="#d4d4d8" fontSize="11" fontFamily="monospace">/api/users</text>
          </g>
          <g transform="translate(200, 220)">
            <rect x="0" y="0" width="110" height="28" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
            <text x="55" y="18" textAnchor="middle" fill="#d4d4d8" fontSize="11" fontFamily="monospace">/api/products</text>
          </g>

          {/* Lines to services */}
          <path id="toUsers" d="M80 248 L80 275" fill="none"/>
          <path d="M80 248 L80 275" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M80 248 L80 275" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" begin="0.6s"/>
          </path>
          <circle r="3" fill="#4ade80" filter="url(#glow2)">
            <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.6s">
              <mpath href="#toUsers"/>
            </animateMotion>
          </circle>

          <path id="toProducts" d="M255 248 L255 275" fill="none"/>
          <path d="M255 248 L255 275" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
          <path d="M255 248 L255 275" stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4" fill="none">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" begin="0.8s"/>
          </path>
          <circle r="3" fill="#4ade80" filter="url(#glow2)">
            <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.8s">
              <mpath href="#toProducts"/>
            </animateMotion>
          </circle>

          {/* Service boxes */}
          <g transform="translate(10, 275)">
            <rect x="0" y="0" width="140" height="65" rx="8" fill="#052e1640" stroke="#4ade8040" strokeWidth="1"/>
            {/* Users icon animated */}
            <g transform="translate(50, 8)">
              <circle cx="20" cy="10" r="8" fill="none" stroke="#4ade80" strokeWidth="1.5"/>
              <circle cx="20" cy="8" r="3" fill="none" stroke="#4ade80" strokeWidth="1"/>
              <circle cx="8" cy="20" r="6" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="32" cy="20" r="6" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" begin="0.5s"/>
              </circle>
            </g>
            <text x="70" y="55" textAnchor="middle" fill="#d4d4d8" fontSize="13" fontFamily="system-ui">Users service</text>
          </g>

          <g transform="translate(185, 275)">
            <rect x="0" y="0" width="145" height="65" rx="8" fill="#052e1640" stroke="#4ade8040" strokeWidth="1"/>
            {/* Products icon animated */}
            <g transform="translate(52, 8)">
              <path d="M20 2 L38 12 L38 32 L20 42 L2 32 L2 12 Z" fill="none" stroke="#4ade80" strokeWidth="1.5">
                <animate attributeName="stroke-dasharray" values="0 200;200 0" dur="3s" repeatCount="indefinite"/>
              </path>
              <line x1="20" y1="22" x2="20" y2="42" stroke="#4ade80" strokeWidth="1"/>
              <line x1="2" y1="12" x2="20" y2="22" stroke="#4ade80" strokeWidth="1"/>
              <line x1="38" y1="12" x2="20" y2="22" stroke="#4ade80" strokeWidth="1"/>
            </g>
            <text x="72" y="55" textAnchor="middle" fill="#d4d4d8" fontSize="13" fontFamily="system-ui">Products service</text>
          </g>

          {/* Cloud service label */}
          <text x="170" y="365" textAnchor="middle" fill="#71717a" fontSize="12" fontFamily="monospace">Your cloud service</text>
        </svg>
      </div>
    </div>
  )
}

// AI Gateway Card
export function AiGatewayCard() {
  return (
    <div className="relative p-8 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group hover:border-yellow-500/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-yellow-400 font-mono text-sm tracking-wider">AI GATEWAY</span>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="lg:w-2/5">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 text-balance">
            Route, secure, and transform traffic to any AI model
          </h3>
        </div>

        <div className="lg:w-3/5 flex justify-center">
          <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
            <defs>
              <filter id="glow3" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15"/>
                <stop offset="100%" stopColor="#eab308"/>
              </linearGradient>
            </defs>

            {/* Inference calls badge */}
            <g transform="translate(130, 0)">
              <rect x="0" y="0" width="150" height="30" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
              <text x="75" y="20" textAnchor="middle" fill="#d4d4d8" fontSize="12" fontFamily="monospace">Your inference calls</text>
            </g>

            {/* Line to logo with multiple particles */}
            <path id="toAiLogo" d="M205 30 L205 65" fill="none"/>
            <path d="M205 30 L205 65" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
            <path d="M205 30 L205 65" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" fill="none">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.6s" repeatCount="indefinite"/>
            </path>
            <circle r="4" fill="#facc15" filter="url(#glow3)">
              <animateMotion dur="0.8s" repeatCount="indefinite">
                <mpath href="#toAiLogo"/>
              </animateMotion>
            </circle>
            <circle r="3" fill="#fde047" filter="url(#glow3)">
              <animateMotion dur="0.8s" repeatCount="indefinite" begin="0.4s">
                <mpath href="#toAiLogo"/>
              </animateMotion>
            </circle>

            {/* Left features with animated icons */}
            <g transform="translate(15, 75)">
              {/* Traffic routing */}
              <g>
                <text x="90" y="12" textAnchor="end" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Traffic routing</text>
                <g transform="translate(98, 0)">
                  <path d="M0 6 L16 6" stroke="#facc15" strokeWidth="1.5"/>
                  <path d="M10 0 L16 6 L10 12" stroke="#facc15" strokeWidth="1.5" fill="none">
                    <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
                  </path>
                </g>
              </g>
              {/* Authentication */}
              <g transform="translate(0, 28)">
                <text x="90" y="12" textAnchor="end" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Authentication</text>
                <g transform="translate(98, -2)">
                  <circle cx="8" cy="8" r="7" fill="none" stroke="#facc15" strokeWidth="1.5"/>
                  <path d="M5 6 Q8 10 11 6" stroke="#facc15" strokeWidth="1" fill="none"/>
                  <circle cx="6" cy="5" r="1" fill="#facc15">
                    <animate attributeName="r" values="1;1.5;1" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="10" cy="5" r="1" fill="#facc15">
                    <animate attributeName="r" values="1;1.5;1" dur="2s" repeatCount="indefinite" begin="0.3s"/>
                  </circle>
                </g>
              </g>
              {/* PII redaction */}
              <g transform="translate(0, 56)">
                <text x="90" y="12" textAnchor="end" fill="#a1a1aa" fontSize="12" fontFamily="monospace">PII redaction</text>
                <g transform="translate(98, 0)">
                  <text fill="#facc15" fontSize="14" fontFamily="monospace">
                    <tspan>|</tspan>
                    <tspan>
                      <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite"/>
                      **
                    </tspan>
                  </text>
                </g>
              </g>
            </g>

            {/* Central logo with animated ring */}
            <circle cx="205" cy="110" r="42" fill="#422006" stroke="#facc1560" strokeWidth="1.5"/>
            <circle cx="205" cy="110" r="42" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="8 4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 205 110" to="360 205 110" dur="20s" repeatCount="indefinite"/>
            </circle>
            <circle cx="205" cy="110" r="50" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.2">
              <animate attributeName="r" values="50;60;50" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite"/>
            </circle>
            <text x="205" y="127" textAnchor="middle" fill="#facc15" fontSize="40" fontWeight="bold" fontFamily="system-ui">n</text>

            {/* Right features with animated icons */}
            <g transform="translate(265, 75)">
              {/* Rate limiting */}
              <g>
                <circle cx="8" cy="8" r="7" fill="none" stroke="#facc15" strokeWidth="1.5"/>
                <g>
                  <line x1="8" y1="4" x2="8" y2="8" stroke="#facc15" strokeWidth="1.5"/>
                  <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="3s" repeatCount="indefinite"/>
                </g>
                <text x="22" y="12" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Rate limiting</text>
              </g>
              {/* Observability */}
              <g transform="translate(0, 28)">
                <circle cx="8" cy="8" r="7" fill="none" stroke="#facc15" strokeWidth="1.5"/>
                <circle cx="8" cy="8" r="3" fill="#facc15">
                  <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <text x="22" y="12" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Observability</text>
              </g>
              {/* Custom logic */}
              <g transform="translate(0, 56)">
                <rect x="2" y="2" width="12" height="8" rx="1" fill="none" stroke="#facc15" strokeWidth="1.5"/>
                <line x1="8" y1="10" x2="8" y2="14" stroke="#facc15" strokeWidth="1.5"/>
                <circle cx="8" cy="16" r="2" fill="#facc15">
                  <animate attributeName="fill-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <text x="22" y="12" fill="#a1a1aa" fontSize="12" fontFamily="monospace">Custom logic</text>
              </g>
            </g>

            {/* Branching lines to AI models */}
            <path id="aiLeft" d="M175 152 L175 180 Q175 195 130 205 L95 215" fill="none"/>
            <path d="M175 152 L175 180 Q175 195 130 205 L95 215" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
            <path d="M175 152 L175 180 Q175 195 130 205 L95 215" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" fill="none">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.2s"/>
            </path>
            <circle r="4" fill="#facc15" filter="url(#glow3)">
              <animateMotion dur="1.3s" repeatCount="indefinite" begin="0.2s">
                <mpath href="#aiLeft"/>
              </animateMotion>
            </circle>

            <path id="aiCenter" d="M205 152 L205 215" fill="none"/>
            <path d="M205 152 L205 215" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
            <path d="M205 152 L205 215" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" fill="none">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.4s"/>
            </path>
            <circle r="4" fill="#facc15" filter="url(#glow3)">
              <animateMotion dur="1s" repeatCount="indefinite" begin="0.4s">
                <mpath href="#aiCenter"/>
              </animateMotion>
            </circle>

            <path id="aiRight" d="M235 152 L235 180 Q235 195 280 205 L315 215" fill="none"/>
            <path d="M235 152 L235 180 Q235 195 280 205 L315 215" stroke="#3f3f46" strokeWidth="1.5" fill="none"/>
            <path d="M235 152 L235 180 Q235 195 280 205 L315 215" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" fill="none">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.6s"/>
            </path>
            <circle r="4" fill="#facc15" filter="url(#glow3)">
              <animateMotion dur="1.3s" repeatCount="indefinite" begin="0.6s">
                <mpath href="#aiRight"/>
              </animateMotion>
            </circle>

            {/* AI Model boxes with animated borders */}
            <g transform="translate(30, 215)">
              <rect x="0" y="0" width="120" height="60" rx="8" fill="none" stroke="#facc1540" strokeWidth="1.5" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="24" dur="2s" repeatCount="indefinite"/>
              </rect>
              <text x="60" y="35" textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="monospace">AI Model</text>
            </g>
            <g transform="translate(145, 215)">
              <rect x="0" y="0" width="120" height="60" rx="8" fill="none" stroke="#facc1540" strokeWidth="1.5" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="24" dur="2s" repeatCount="indefinite" begin="0.5s"/>
              </rect>
              <text x="60" y="35" textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="monospace">AI Model</text>
            </g>
            <g transform="translate(260, 215)">
              <rect x="0" y="0" width="120" height="60" rx="8" fill="none" stroke="#facc1540" strokeWidth="1.5" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="24" dur="2s" repeatCount="indefinite" begin="1s"/>
              </rect>
              <text x="60" y="35" textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="monospace">AI Model</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

// Main Feature Cards Grid
export function FeatureCards() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ShareLocalhostCard />
        <ApiGatewayCard />
      </div>
      <AiGatewayCard />
    </section>
  )
}
