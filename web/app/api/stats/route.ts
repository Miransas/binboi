import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  // 1. Güvenlik Kontrolü (Sadece giriş yapmış kullanıcı istatistik görebilsin)
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Canlı Veri Simülasyonu (Veya Go Backend'den veri çekme)
  // Şimdilik dashboard animasyonları çalışsın diye rastgele veri dönüyoruz
  const mockStats = {
    kbps: Math.floor(Math.random() * 800) + 100, // 100-900 arası rastgele hız
    latency: Math.floor(Math.random() * 40) + 10, // 10-50ms arası gecikme
    activeTunnels: 2,
    totalRequests: 1450,
  };

  return NextResponse.json(mockStats);
}