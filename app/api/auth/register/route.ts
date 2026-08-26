import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, password, referredByCode } = body as {
      fullName?: string
      email?: string
      password?: string
      referredByCode?: string | null
    }

    if (!fullName?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()

    // 1. Pre-check if user email already exists in public.users
    const { data: existingUser } = await serviceClient
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      )
    }

    // 2. Create user via Supabase Admin API (bypasses SMTP rate limits and auto-confirms email)
    const { data: adminAuthData, error: adminAuthError } =
      await serviceClient.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: cleanName },
      })

    if (adminAuthError || !adminAuthData.user) {
      // Fallback to standard signUp if admin API fails
      const supabase = await createClient()
      const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: cleanName } },
      })

      if (fallbackError || !fallbackData.user) {
        return NextResponse.json(
          { error: fallbackError?.message || adminAuthError?.message || 'Failed to create account.' },
          { status: 400 }
        )
      }
    }

    const user = adminAuthData?.user!
    const referralCode = 'SNAP' + nanoid(6).toUpperCase()

    // 3. Upsert profile row in public.users
    const { data: profileCheck } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileCheck) {
      await serviceClient
        .from('users')
        .update({ name: cleanName, email: cleanEmail })
        .eq('id', user.id)
    } else {
      const { error: profileError } = await serviceClient.from('users').insert({
        id: user.id,
        email: cleanEmail,
        name: cleanName,
        referral_code: referralCode,
        referred_by: referredByCode || null,
        role: 'user',
        wallet_balance: 0,
        post_count: 0,
        has_paid_platform_fee: false,
      })

      if (profileError && !profileError.message.includes('duplicate key')) {
        console.error('Profile insertion error:', profileError)
      }
    }

    // 4. Handle referral tracking
    if (referredByCode) {
      try {
        const { data: referrer } = await serviceClient
          .from('users')
          .select('id')
          .eq('referral_code', referredByCode)
          .single()

        if (referrer && referrer.id !== user.id) {
          await serviceClient.from('referrals').insert({
            referrer_id: referrer.id,
            referred_id: user.id,
            status: 'pending',
            commission_amount: 0,
          })
        }
      } catch (refErr) {
        console.error('Referral insert error:', refErr)
      }
    }

    // 5. Sign user in to set browser session cookies
    const supabase = await createClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    return NextResponse.json({
      success: true,
      autoSignedIn: !signInErr,
    })
  } catch (err: unknown) {
    console.error('Registration route error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server registration error' },
      { status: 500 }
    )
  }
}
