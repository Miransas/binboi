export type Tag = "ai" | "perf" | "ui" | "fix" | "hotfix";

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  isoDate: string;
  title: string;
  description: string;
  tags: Tag[];
  features: { label: string; detail: string }[];
  fixes?: string[];
  expandFeatures?: string[];
  code?: string;
  visual: "radial" | "hex" | "wave" | "grid" | "minimal";
  major: boolean;
}

export const entries: ChangelogEntry[] = [
  {
    id: "v2.1",
    version: "2.1",
    date: "Jun 30, 2025",
    isoDate: "2025-06-30",
    title: "Advanced Reasoning Engine",
    description:
      "Significantly improved logical thinking, multi-modal processing, and context-aware responses across all conversation types.",
    tags: ["ai", "perf", "ui"],
    features: [
      { label: "Advanced reasoning engine", detail: "with improved logical thinking" },
      { label: "Multi-modal processing", detail: "for text, images, and code analysis" },
      { label: "Context-aware responses", detail: "with better conversation memory" },
      { label: "Adaptive communication", detail: "that matches user preferences" },
    ],
    expandFeatures: [
      "Saved memories panel with per-session recall",
      "User rules system for persistent preferences",
      "Real-time reasoning trace visible in sidebar",
      "Improved code execution sandbox",
    ],
    fixes: [
      "Fixed memory leaks in long conversations",
      "Resolved image upload timeout on slow connections",
      "Fixed markdown rendering in streamed responses",
    ],
    code: `const agent = new AIAgent({\n  model: "kimi-k2",\n  reasoning: "enhanced",\n  multiModal: true,\n})`,
    visual: "radial",
    major: true,
  },
  {
    id: "v1.2",
    version: "1.2",
    date: "Jun 15, 2025",
    isoDate: "2025-06-15",
    title: "Enhanced AI Agent Interface & Reasoning Capabilities",
    description:
      "A complete overhaul of the agent interface, introducing real-time learning and adaptive communication systems.",
    tags: ["ai", "ui"],
    features: [
      { label: "Enhanced Reasoning", detail: "Improved logical thinking and problem-solving" },
      { label: "Context Awareness", detail: "Better understanding of conversation history" },
      { label: "Multi-modal Support", detail: "Process text, images, and code simultaneously" },
      { label: "Adaptive Responses", detail: "Tailored communication style based on user preferences" },
      { label: "Real-time Learning", detail: "Dynamic adaptation during conversations" },
    ],
    expandFeatures: [
      "New sidebar agent panel with persistent memory",
      "Reasoning trace with step-by-step breakdown",
      "Custom tool calling via user-defined functions",
      "Improved streaming speed for long outputs",
    ],
    fixes: [
      "Resolved context window truncation issue",
      "Fixed race condition in multi-tool streaming",
      "Corrected JSON schema validation edge cases",
    ],
    visual: "hex",
    major: true,
  },
  {
    id: "v1.1.2",
    version: "1.1.2",
    date: "Jun 3, 2025",
    isoDate: "2025-06-03",
    title: "Streaming stability & latency improvements",
    description: "Patched critical streaming regressions and reduced P99 latency by ~30%.",
    tags: ["fix"],
    features: [],
    visual: "minimal",
    major: false,
  },
  {
    id: "v1.0.5",
    version: "1.0.5",
    date: "Dec 10, 2024",
    isoDate: "2024-12-10",
    title: "Inference throughput +45% via kernel optimizations",
    description:
      "Rewrote core attention kernels with FlashAttention-3; reduced GPU memory usage on long contexts.",
    tags: ["perf"],
    features: [],
    visual: "wave",
    major: false,
  },
  {
    id: "v1.0.3",
    version: "1.0.3",
    date: "Nov 20, 2024",
    isoDate: "2024-11-20",
    title: "Redesigned conversation sidebar & file attachments",
    description:
      "New collapsible sidebar, drag-and-drop file uploads, and improved mobile layout.",
    tags: ["ui"],
    features: [],
    visual: "grid",
    major: false,
  },
];
