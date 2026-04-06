"use client";
import { useState } from "react";

function highlight(code: string) {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/[^\n]*)/g, '<span class="text-white/25">$1</span>')
    .replace(/\b(const|new|true|false)\b/g, '<span class="text-[#ff6b6b]">$1</span>')
    .replace(/\b(AIAgent)\b/g, '<span class="text-[#57c8ff]">$1</span>')
    .replace(/"([^"]*)"/g, '"<span class="text-[#b8ff57]">$1</span>"');
}

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group bg-[#0d0d0d] border border-white/[0.07] rounded-lg overflow-hidden mb-4">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white/40 hover:text-white/70 border border-white/10 rounded px-2 py-0.5"
      >
        {copied ? "copied!" : "copy"}
      </button>
      <pre
        className="p-4 font-mono text-[12px] leading-[1.7] overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlight(code) }}
      />
    </div>
  );
}
