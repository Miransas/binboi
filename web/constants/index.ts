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
  FiSearch,
  FiFileText,
  FiCpu,
  FiCreditCard,
  FiHelpCircle,
  FiBookOpen,
  FiSliders,
} from "react-icons/fi"

import { Sparkles } from "lucide-react" 
import { label } from "three/src/nodes/core/ContextNode.js";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Status", href: "/status" },
];

export const DASHBOARD_LINKS = [
  {
    title: "Getting Started",
    items: [
      {label: "Welcome", href: "/dashboard", icon: FiHome },
      { label: "Setup & Installation", href: "/dashboard/setup", icon: FiHome },
      { label: "Your Authtoken", href: "/dashboard/authtoken", icon: FiKey },
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
    title: "Traffic Observability",
    items: [
      { label: "Traffic Inspector", href: "/dashboard/inspector", icon: FiSearch },
      { label: "Log Exporting", href: "/dashboard/log-export", icon: FiFileText },
    ],
  },
  {
    title: "Secure Tunnels",
    items: [
      { label: "Agents", href: "/dashboard/agents", icon: FiCpu },
      { label: "Connect URLs", href: "/dashboard/connect", icon: FiLink },
    ],
  },
  {
    title: "Other",
    items: [
      { label: "Billing & Usage", href: "/dashboard/billing", icon: FiCreditCard },
      { label: "Early Access", href: "/dashboard/early", icon: FiBox },
      { label: "Support", href: "/dashboard/support", icon: FiHelpCircle },
      { label: "Documentation", href: "/dashboard/docs", icon: FiBookOpen },
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
    { label: "Download", href: "/download" },
    { label: "Changelog", href: "/changelog" },
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