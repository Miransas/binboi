// constants/index.ts
import {
  FiHome,
  FiKey,
  FiGlobe,
  FiLink,
  FiLock,
  FiBox,
  FiShield,
  FiSlash,
  FiSliders,
} from "react-icons/fi"

import { Sparkles } from "lucide-react" 

export const NAV_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
  { label: "Typography", href: "/typography" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy", href: "/privacy" },
];

export const DASHBOARD_LINKS = [
  {
    title: "Getting Started",
    items: [
      {label: "Welcome", href: "/dashboard", icon: FiHome },
      { label: "Setup & Installation", href: "/dashboard/setup", icon: FiHome },
      { label: "Access Tokens", href: "/dashboard/access-tokens", icon: FiKey },
      { label: "Tunnel", href: "/dashboard/tunnel", icon: FiSliders },
    ],
  },
  {
    title: "Universal Gateway",
    items: [
      { label: "Endpoints & Traffic Policy", href: "/dashboard/endpoints", icon: FiGlobe },
      { label: "AI Gateways", href: "/dashboard/ai", icon: Sparkles, badge: "Early Access" },
      { label: "Domains", href: "/dashboard/domains", icon: FiLink },
      { label: "TCP Addresses", href: "/dashboard/tcp", icon: FiLink },
      { label: "TLS Certificates", href: "/dashboard/tls", icon: FiLock },
      { label: "Kubernetes Operators", href: "/dashboard/k8s", icon: FiBox },
      { label: "Vaults & Secrets", href: "/dashboard/secrets", icon: FiShield },
      { label: "IP Policies", href: "/dashboard/ip", icon: FiSlash },
      { label: "TLS Certificate Authorities", href: "/dashboard/ca", icon: FiLock },
      { label: "Traffic Identities", href: "/dashboard/identities", icon: FiKey },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Vaults & Secrets", href: "/dashboard/secrets", icon: FiShield },
      { label: "IP Policies", href: "/dashboard/ip", icon: FiSlash },
    ],
  },
]

export const DOCS_LINKS = [
    
  { label: "Introduction", href: "/docs" },
  { label: "Quick Start", href: "/docs/quick-start" },
  { label: "CLI Reference", href: "/docs/cli" },
  { label: "Self-Hosting", href: "/docs/self-hosting" },
];

export const FOOTER_LINKS = {
  product: [
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "Miransas", href: "https://miransas.com" },
    { label: "GitHub", href: "https://github.com/sardorazimov/binboi" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
