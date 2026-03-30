import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth, authEnabled } from '@/auth'
 
export async function proxy(request: NextRequest) {
  if (!authEnabled) {
    return NextResponse.next()
  }

  const session = await auth()

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
 
export default proxy
 
export const config = {
  matcher: ['/dashboard/:path*'],
}
