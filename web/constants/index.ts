// constants/index.ts
import {
  FiActivity,
  FiHome,
  FiKey,
  FiGlobe,
  FiLink,
  FiSliders,
  FiCreditCard,
  FiUser,
} from "react-icons/fi"
import { MdOutlineSettingsInputComposite } from "react-icons/md";


import { ArrowUpRight, BookOpen, Bot, LifeBuoy, Sparkles } from "lucide-react" 

export const NAV_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "Sowcase", href: "/showcase" },
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
      { label: "User Management", href: "/dashboard/user-management", icon: FiUser },
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

export const footerLinks = {
  Product: [
    { name: "Docs", href: "/docs" },
    { name: "Pricing", href: "/pricing" },
    { name: "Changelog", href: "/changelog" },
    { name: "Support", href: "/support" },
  ],
  Platform: [
    { name: "Quick Start", href: "/docs/quick_start" },
    { name: "HTTP Tunnels", href: "/docs/http_tunnels" },
    { name: "Requests", href: "/docs/requests" },
    { name: "API", href: "/docs/api" },
  ],
  Workflows: [
    { name: "Webhooks", href: "/docs/webhooks" },
    { name: "Logs", href: "/docs/logs" },
    { name: "Regions", href: "/docs/regions" },
    { name: "Troubleshooting", href: "/docs/troubleshooting" },
  ],
  Company: [
    { name: "Register", href: "/register" },
    { name: "Login", href: "/login" },
    { name: "Terms", href: "/terms" },
    { name: "Status", href: "/docs/bugs" },
  ],
};

export const footerSocialLinks = [
  { name: "Docs", icon: BookOpen, href: "/docs" },
  { name: "API", icon: Bot, href: "/docs/api" },
  { name: "Support", icon: LifeBuoy, href: "/support" },
  { name: "Pricing", icon: ArrowUpRight, href: "/pricing" },
];
