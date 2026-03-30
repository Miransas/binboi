"use client";
import { useEffect, useState } from "react";
import { Copy, RefreshCcw, Eye, EyeOff, Check } from "lucide-react";
import { buildApiUrl } from "@/lib/binboi";

export default function TokenManager({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken || "TOKEN_NOT_SET");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) {
      return;
    }

    let cancelled = false;
    async function loadCurrentToken() {
      try {
        const res = await fetch(buildApiUrl("/api/tokens/current"));
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.token) {
          setToken(data.token);
        }
      } catch {
      }
    }

    loadCurrentToken();
    return () => {
      cancelled = true;
    };
  }, [initialToken]);

  const generateNewToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl("/api/tokens/generate"), { 
        method: "POST" 
      });

      if (!res.ok) throw new Error("SERVER_CONNECTION_FAILED");

      const data = await res.json();
      
      setToken(data.token);
    } catch (err) {
      console.error("🔴 [AUTH_ERROR]:", err);
      setError("The control plane is unavailable. Start the relay and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-[#080808] border border-white/10 rounded-2xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Instance Token</h3>
        
        <button 
          onClick={generateNewToken}
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-lg transition-all group/btn"
        >
          <RefreshCcw 
            size={16} 
            className={`text-miransas-cyan transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover/btn:rotate-180'}`} 
          />
        </button>
      </div>

      <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 font-mono">
        <div className="flex-1 text-sm truncate text-gray-300">
          {isVisible ? token : "••••••••••••••••••••••••••••••••"}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsVisible(!isVisible)} className="p-2 text-gray-600 hover:text-white transition-colors">
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <button onClick={copyToClipboard} className="p-2 text-gray-600 hover:text-miransas-cyan transition-colors">
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <p className="mt-4 text-[9px] text-gray-600 italic leading-relaxed">
        Use this token with the CLI: <span className="text-miransas-cyan">binboi auth [token]</span>
      </p>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
