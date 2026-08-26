'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('General Query')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to send message.')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: 'rgba(96,64,209,0.1)', color: '#6040d1' }}>
          Support &amp; Help
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: '#000000' }}>
          Get in Touch with snapShop ✉️
        </h1>
        <p className="text-sm mb-8" style={{ color: '#bab0c1' }}>
          Have questions about a deal, referral rewards, or affiliate partnership? We&apos;re here to help!
        </p>

        {submitted ? (
          <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: 'rgba(22,163,74,0.05)', borderColor: '#bbf7d0' }}>
            <span className="text-4xl mb-2 block">✅</span>
            <h3 className="text-lg font-bold text-black mb-1">Message Sent Successfully!</h3>
            <p className="text-sm" style={{ color: '#4b5563' }}>
              Thank you for reaching out, {name}. Your inquiry has been received by our support team and logged in the Admin Panel. We will respond to <strong>{email}</strong> within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setName('')
                setEmail('')
                setMessage('')
              }}
              className="mt-6 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
              style={{ backgroundColor: '#6040d1' }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
            {error && (
              <div className="p-3 rounded-xl border bg-red-50 text-xs font-semibold text-red-600" style={{ borderColor: '#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: '#000000' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6040d1]"
                  style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: '#000000' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6040d1]"
                  style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#000000' }}>
                Subject Category
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6040d1]"
                style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
              >
                <option value="General Query">General Query</option>
                <option value="Withdrawal Issue">Withdrawal / Payout Issue</option>
                <option value="Referral Tracking">Referral Rewards</option>
                <option value="Report Broken Deal">Report Fake or Broken Deal</option>
                <option value="Affiliate Partnership">Affiliate Partnership</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#000000' }}>
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your query or issue in detail..."
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6040d1]"
                style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff', color: '#000000' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60 cursor-pointer shadow-xs"
              style={{ backgroundColor: '#6040d1' }}
            >
              {loading ? 'Sending Message…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
