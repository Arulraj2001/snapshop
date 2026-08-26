'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function OtpLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({ email })

    setLoading(false)

    if (otpError) {
      setError(otpError.message)
    } else {
      setStep('otp')
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    setLoading(false)

    if (verifyError) {
      setError(verifyError.message)
    } else {
      router.push('/dashboard')
    }
  }

  const inputStyle = {
    borderColor: '#d7d5dc',
    backgroundColor: '#ffffff',
    color: '#000000',
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px #6040d1'
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-6 shadow-sm"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#000000' }}>
        {step === 'email' ? 'Sign In with OTP' : 'Enter Your Code'}
      </h1>
      <p className="text-sm mb-6" style={{ color: '#bab0c1' }}>
        {step === 'email'
          ? "We'll send a one-time code to your email."
          : `Code sent to ${email}`}
      </p>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="otp-email"
              className="text-sm font-medium"
              style={{ color: '#000000' }}
            >
              Email
            </label>
            <input
              id="otp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border px-3 py-2 text-sm outline-none transition"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#dc2626' }}>
              {error}
            </p>
          )}

          <button
            id="otp-send-btn"
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
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="otp-code"
              className="text-sm font-medium"
              style={{ color: '#000000' }}
            >
              6-digit Code
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="rounded-lg border px-3 py-2 text-sm outline-none transition tracking-[0.3em] text-center font-mono"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#dc2626' }}>
              {error}
            </p>
          )}

          <button
            id="otp-verify-btn"
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
            {loading ? 'Verifying…' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email')
              setOtp('')
              setError(null)
            }}
            className="text-sm text-center"
            style={{ color: '#bab0c1', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Use a different email
          </button>
        </form>
      )}

      <div className="mt-5 text-center text-sm">
        <Link href="/login" style={{ color: '#6040d1' }}>
          Back to password sign in
        </Link>
      </div>
    </div>
  )
}
