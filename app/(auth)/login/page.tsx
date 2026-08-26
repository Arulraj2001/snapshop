'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleGoogleLogin() {
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-6 shadow-sm"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#d7d5dc',
      }}
    >
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#000000' }}>
        Sign In
      </h1>
      <p className="text-sm mb-5" style={{ color: '#bab0c1' }}>
        Welcome back to snapShop
      </p>

      {/* Google OAuth Button */}
      <div className="mb-5">
        <button
          type="button"
          id="login-google-btn"
          onClick={handleGoogleLogin}
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
          Continue with Google
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
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="login-email" className="text-sm font-medium" style={{ color: '#000000' }}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
            style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="login-password" className="text-sm font-medium" style={{ color: '#000000' }}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#6040d1]"
            style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
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
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 cursor-pointer"
          style={{ backgroundColor: loading ? '#655baa' : '#6040d1' }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#655baa'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#6040d1'
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Footer links */}
      <div className="mt-5 flex flex-col gap-2 text-center text-sm">
        <p style={{ color: '#bab0c1' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium" style={{ color: '#6040d1' }}>
            Sign up
          </Link>
        </p>
        <Link href="/login/otp" className="text-sm" style={{ color: '#6040d1' }}>
          Sign in with OTP instead
        </Link>

        {/* Back to Home Button */}
        <div className="pt-3 border-t mt-2 flex justify-center" style={{ borderColor: '#f2f3fb' }}>
          <Link
            href="/"
            id="login-back-home-btn"
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
            style={{ color: '#bab0c1', textDecoration: 'none' }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
