import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { serviceClient } from '@/lib/supabase/service'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabaseResponse = NextResponse.redirect(`${requestUrl.origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && authData.user) {
      const user = authData.user

      // Check if profile exists, if not create using serviceClient
      const { data: existing } = await serviceClient
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existing) {
        const referralCode = 'SNAP' + nanoid(6).toUpperCase()
        const referredByCode = request.cookies.get('snapshop_ref')?.value || null

        await serviceClient.from('users').upsert({
          id: user.id,
          email: user.email,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User',
          referral_code: referralCode,
          referred_by: referredByCode,
          role: 'user',
          wallet_balance: 0,
          post_count: 0,
          has_paid_platform_fee: false,
        }, { onConflict: 'id' })
      }

      return supabaseResponse
    }
  }

  // Return user to login if verification or code exchange failed
  return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
}
