import { type NextRequest } from 'next/server'
import { refreshSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Refresh Supabase auth session on every request
  const response = await refreshSession(request)

  // Handle referral tracking via ?ref= query param
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && !request.cookies.has('snapshop_ref')) {
    response.cookies.set('snapshop_ref', ref, {
      maxAge: 604800, // 7 days
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images:
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
