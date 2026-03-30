import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/binboi";

export async function GET() {
  try {
    const [instanceRes, tunnelsRes] = await Promise.all([
      fetch(buildApiUrl("/api/instance"), { cache: "no-store" }),
      fetch(buildApiUrl("/api/tunnels"), { cache: "no-store" }),
    ]);

    if (!instanceRes.ok || !tunnelsRes.ok) {
      throw new Error("control plane unavailable");
    }

    const instance = await instanceRes.json();
    const tunnels = await tunnelsRes.json();

    const totalRequests = Array.isArray(tunnels)
      ? tunnels.reduce((sum, tunnel) => sum + (tunnel.request_count || 0), 0)
      : 0;

    const totalTransfer = Array.isArray(tunnels)
      ? tunnels.reduce((sum, tunnel) => sum + (tunnel.bytes_out || 0), 0)
      : 0;

    return NextResponse.json({
      kbps: Math.round(totalTransfer / 1024),
      latency: 0,
      activeTunnels: instance.active_tunnels ?? 0,
      totalRequests,
    });
  } catch {
    return NextResponse.json({
      kbps: 0,
      latency: 0,
      activeTunnels: 0,
      totalRequests: 0,
    });
  }
}
