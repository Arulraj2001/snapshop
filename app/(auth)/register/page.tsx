'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/client'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCodeInput, setReferralCodeInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Pre-fill referral code from URL param (?ref=CODE) or cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refParam = params.get('ref')
    if (refParam) {
      setReferralCodeInput(refParam.toUpperCase())
      return
    }
    const cookieMatch = document.cookie.match(/(?:^|; )snapshop_ref=([^;]*)/)
    if (cookieMatch) {
      setReferralCodeInput(decodeURIComponent(cookieMatch[1]).toUpperCase())
    }
  }, [])

  async function handleGoogleSignup() {
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (oauthError) setError(oauthError.message)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      // Input field takes priority over cookie
      const referredByCode = referralCodeInput.trim().toUpperCase() || getCookie('snapshop_ref') || null

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          referredByCode,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error ?? 'Registration failed.')
      }

      deleteCookie('snapshop_ref')

      if (result.requiresEmailConfirmation) {
        setError('Account created! Please check your email to confirm your account.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to create account.')
    }
  }

  const inputClass =
    'rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1] w-full'
  const inputStyle = {
    borderColor: '#d7d5dc',
    backgroundColor: '#ffffff',
    color: '#000000',
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-6 shadow-sm"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#000000' }}>
        Create Account
      </h1>
      <p className="text-sm mb-5" style={{ color: '#bab0c1' }}>
        Join snapShop and start sharing deals
      </p>

      {/* Google OAuth Button */}
      <div className="mb-5">
        <button
          type="button"
          id="reg-google-btn"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg border py-2 px-4 text-sm font-medium transition cursor-pointer"
          style={{ borderColor: '#d7d5dc', color: '#000000', backgroundColor: '#ffffff' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2f3fb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.0 10.05.0 12s.47 3.8 1.29 5.42l3.99-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          Sign up with Google
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t" style={{ borderColor: '#d7d5dc' }} />
        <span className="absolute px-2 text-xs uppercase" style={{ backgroundColor: '#ffffff', color: '#bab0c1' }}>
          or with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-name" className="text-sm font-medium" style={{ color: '#000000' }}>
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-email" className="text-sm font-medium" style={{ color: '#000000' }}>
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-password" className="text-sm font-medium" style={{ color: '#000000' }}>
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Referral Code (optional) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-referral" className="text-sm font-medium" style={{ color: '#000000' }}>
            Referral Code <span className="text-xs font-normal" style={{ color: '#bab0c1' }}>(optional)</span>
          </label>
          <input
            id="reg-referral"
            type="text"
            autoComplete="off"
            value={referralCodeInput}
            onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. SNAPABC123"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="reg-confirm" className="text-sm font-medium" style={{ color: '#000000' }}>
            Confirm Password
          </label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Inline error */}
        {error && (
          <p className="text-sm" style={{ color: '#dc2626' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 cursor-pointer"
          style={{ backgroundColor: '#6040d1' }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#655baa'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#6040d1'
          }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm">
        <p style={{ color: '#bab0c1' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: '#6040d1' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
