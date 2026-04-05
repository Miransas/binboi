// constants/index.ts
import {
  FiActivity,
  FiHome,
  FiKey,
  FiGlobe,
  FiLink,
  FiSliders,
  FiCreditCard,
} from "react-icons/fi"
import { MdOutlineSettingsInputComposite } from "react-icons/md";


import { Sparkles } from "lucide-react" 

export const NAV_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Typography", href: "/typography" },
  { label: "Privacy", href: "/privacy" },
];

export const DASHBOARD_LINKS = [
  {
    title: "Getting Started",
    items: [
      {label: "Welcome", href: "/dashboard", icon: FiHome },
      { label: "Setup & Installation", href: "/dashboard/setup", icon: MdOutlineSettingsInputComposite },
      { label: "Access Tokens", href: "/dashboard/access-tokens", icon: FiKey },
      { label: "Billing", href: "/dashboard/billing", icon: FiCreditCard },
      { label: "Tunnel", href: "/dashboard/tunnel", icon: FiSliders },
    ],
  },
  {
    title: "Universal Gateway",
    items: [
      { label: "Requests", href: "/dashboard/requests", icon: FiActivity },
      { label: "Webhooks", href: "/dashboard/webhooks", icon: FiGlobe },
      { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles, badge: "New" },
      { label: "Domains", href: "/dashboard/domains", icon: FiLink },
    ],
  },
]

export const DOCS_LINKS = [
  { label: "Introduction", href: "/docs" },
  { label: "Quick Start", href: "/docs/quick-start" },
  { label: "Authentication", href: "/docs/authentication" },
  { label: "CLI Reference", href: "/docs/cli" },
  { label: "HTTP Tunnels", href: "/docs/http-tunnels" },
  { label: "Webhooks", href: "/docs/webhooks" },
  { label: "Troubleshooting", href: "/docs/troubleshooting" },
];

export const FOOTER_LINKS = {
  product: [
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
    { label: "Typography", href: "/typography" },
  ],
  company: [
    { label: "Miransas", href: "https://miransas.com" },
    { label: "GitHub", href: "https://github.com/Miransas/binboi" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
