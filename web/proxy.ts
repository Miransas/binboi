import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth' // Auth.js v5 importun (yolunu projene göre uyarla)
 
export async function proxy(request: NextRequest) {
  // 1. Kullanıcının oturum durumunu kontrol et
  const session = await auth()

  // 2. Eğer oturum YOKSA ve girmeye çalıştığı yer /dashboard ise
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Kullanıcıyı login sayfasına şutla
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 3. Oturum varsa veya dashboard dışında bir yere gidiyorsa yola devam etsin
  return NextResponse.next()
}
 
// Next.js'in dosyayı tanıması için default olarak da dışarı aktarıyoruz
export default proxy
 
export const config = {
  // Sadece dashboard ve altındaki rotaları dinle
  matcher: ['/dashboard/:path*'],
}