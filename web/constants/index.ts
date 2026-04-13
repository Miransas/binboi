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
import { BsGithub } from "react-icons/bs";

export const NAV_LINKS = [
  { label: "Docs", link: "https://www.dosc.binboi.com/docs" },
  { label: "Pricing", link: "/pricing" },
  { label: "Blog", link: "/blog" },
  { label: "Changelog", link: "/changelog" },
  { label: "Sowcase", link: "/showcase" },
  { label: "Privacy", link: "/privacy" }, 
];

export const DASHBOARD_LINKS = [
  {
    title: "Getting Started",
    items: [
      {label: "Welcome", href: "/dashboard", icon: FiHome },
      { label: "Setup & Installation", href: "/dashboard/setup", icon: MdOutlineSettingsInputComposite },
      { label: "Access Tokens", href: "/dashboard/access-tokens", icon: FiKey },
      { label: "Billing", href: "/dashboard/billing", icon: FiCreditCard },
      // { label: "User Management", href: "/dashboard/user-management", icon: FiUser },
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
    { label: "Docs", href: "https://www.dosc.binboi.com/docs" },
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
     { label: "Private", href: "/private" },
    

  ],
};

export const footerLinks = {
  Product: [
    { name: "Docs", href: "https://www.dosc.binboi.com/docs" },
    { name: "Pricing", href: "/pricing" },
    { name: "Changelog", href: "/changelog" },
    { name: "Support", href: "/support" }, 
    { name: "Private", href: "/private" },
  ], 
  Platform: [
    { name: "Quick Start", href: "https://www.dosc.binboi.com/docs/quick_start" },
    { name: "HTTP Tunnels", href: "https://www.dosc.binboi.com/docs/s/http_tunnels" },
    { name: "Requests", href: "/https://www.dosc.binboi.com/docs/requests" },
    { name: "API", href: "/https://www.dosc.binboi.com/docs/api" },
  ],
  Workflows: [
    { name: "Webhooks", href: "/https://www.dosc.binboi.com/docs/webhooks" },
    { name: "Logs", href: "/https://www.dosc.binboi.com/docs/logs" },
    { name: "Regions", href: "/https://www.dosc.binboi.com/docs/regions" },
    { name: "Troubleshooting", href: "/https://www.dosc.binboi.com/docs/troubleshooting" },
  ],
  Company: [
    { name: "Register", href: "/register" },
    { name: "Login", href: "/login" },
    { name: "Terms", href: "/terms" },
    { name: "Status", href: "/https://www.dosc.binboi.com/docs/bugs" },
  ],
};

export const footerSocialLinks = [
  { name: "Docs", icon: BookOpen, href: "/docs" },
  { name: "API", icon: Bot, href: "/docs/api" },
  { name: "Support", icon: LifeBuoy, href: "/support" },
  { name: "Pricing", icon: ArrowUpRight, href: "/pricing" },
  { name: "Github", icon: BsGithub, href: "https://github.com/miransas/binboi" },

];
