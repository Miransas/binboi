/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Globe, CheckCircle2, Clock, RefreshCw, Copy, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

export default function DomainsTable() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  // 1. Go Backend'den verileri çekelim
  const fetchDomains = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/domains");
      const data = await res.json();
      setDomains(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDomains(); }, []);

  // 2. Doğrulama İşlemi
  const handleVerify = async (domainName: string) => {
    setVerifying(domainName);
    try {
      const res = await fetch("http://localhost:8080/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain_name: domainName }),
      });

      if (res.ok) {
        alert("🟢 SYSTEM_CONFIRMED: Neural Link Verified!");
        fetchDomains(); // Listeyi tazele
      } else {
        alert("🔴 DNS_NOT_FOUND: TXT kaydı henüz algılanamadı. Biraz daha bekle usta.");
      }
    } catch (err) {
      alert("🔴 CONNECTION_ERROR: Sunucuya ulaşılamıyor.");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className=" overflow-hidden ">
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">Domains_Registry</h2>
          <p className="text-[10px] text-gray-200 mt-1 uppercase font-bold">Manage your neural entry points</p>
        </div>
        <button className="px-6 py-2 bg-miransas-cyan bg-white text-black font-black italic text-xs uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,209,0.2)]">
          + Add Domain
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/[0.02] text-[10px] text-gray-200 font-bold tracking-[0.2em] uppercase">
            <th className="p-6 border-b border-white/5">Namespace</th>
            <th className="p-6 border-b border-white/5">DNS Configuration</th>
            <th className="p-6 border-b border-white/5">Status</th>
            <th className="p-6 border-b border-white/5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            <tr><td colSpan={4} className="p-10 text-center animate-pulse text-miransas-cyan italic">SYNCHRONIZING_DATABASE...</td></tr>
          ) : domains.map((domain, i) => (
            <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
              <td className="p-6">
                <div className="flex items-center gap-4">
                  <Globe size={18} className="text-gray-600 group-hover:text-miransas-cyan transition-colors" />
                  <span className="font-bold text-lg italic text-white">{domain.name}</span>
                </div>
              </td>
              <td className="p-6">
                {domain.status === 'PENDING' ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-600 font-bold">ADD_TXT_RECORD:</span>
                    <code className="text-[10px] bg-black p-1 px-2 rounded border border-white/5 text-miransas-cyan w-fit">
                      {domain.expected_txt}
                    </code>
                  </div>
                ) : (
                  <span className="text-[10px] font-black border border-miransas-cyan/20 px-2 py-1 rounded text-miransas-cyan bg-miransas-cyan/5">
                    {domain.type}
                  </span>
                )}
              </td>
              <td className="p-6">
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase ${
                  domain.status === 'VERIFIED' ? 'text-miransas-cyan' : 'text-yellow-500 animate-pulse'
                }`}>
                  {domain.status === 'VERIFIED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {domain.status}
                </div>
              </td>
              <td className="p-6 text-right">
                {domain.status === 'PENDING' && (
                  <button 
                    onClick={() => handleVerify(domain.name)}
                    disabled={verifying === domain.name}
                    className="p-2 px-4 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black hover:bg-white/10 transition-all flex items-center gap-2 ml-auto"
                  >
                    {verifying === domain.name ? <RefreshCw size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                    VERIFY_DNS
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}