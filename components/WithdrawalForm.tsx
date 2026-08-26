'use client'

import { useState } from 'react'

interface WithdrawalFormProps {
  balance: number
  minWithdrawal: number
}

export default function WithdrawalForm({
  balance,
  minWithdrawal,
}: WithdrawalFormProps) {
  const [amount, setAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const canWithdraw = balance >= minWithdrawal
  const progress = Math.min(100, (balance / minWithdrawal) * 100)

  const ringFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px #6040d1'
  }
  const ringBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = 'none'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (amt > balance) {
      setError('Amount exceeds your wallet balance')
      return
    }
    if (amt < minWithdrawal) {
      setError(`Minimum withdrawal is ₹${minWithdrawal}`)
      return
    }
    if (!upiId.trim()) {
      setError('UPI ID is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, upi_id: upiId.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition'
  const inputStyle = {
    borderColor: '#d7d5dc',
    backgroundColor: '#ffffff',
    color: '#000',
  }

  return (
    <div
      className="rounded-xl border p-4 mb-4"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      <p className="font-semibold text-sm mb-3" style={{ color: '#000' }}>
        Withdraw Earnings
      </p>

      {/* Success state */}
      {success ? (
        <div className="text-center py-3">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm font-semibold" style={{ color: '#000' }}>
            Request submitted!
          </p>
          <p className="text-xs mt-1" style={{ color: '#bab0c1' }}>
            We&apos;ll process your withdrawal within 24 hours.
          </p>
        </div>
      ) : !canWithdraw ? (
        /* Progress towards minimum */
        <div>
          <p className="text-xs mb-3" style={{ color: '#bab0c1' }}>
            Minimum{' '}
            <strong style={{ color: '#000' }}>
              ₹{minWithdrawal.toLocaleString('en-IN')}
            </strong>{' '}
            required to withdraw. You have{' '}
            <strong style={{ color: '#6040d1' }}>
              ₹{balance.toLocaleString('en-IN')}
            </strong>
            .
          </p>
          {/* Progress bar */}
          <div
            className="rounded-full h-2 overflow-hidden"
            style={{ backgroundColor: '#d7d5dc' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ backgroundColor: '#6040d1', width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs font-medium" style={{ color: '#6040d1' }}>
              ₹{balance.toLocaleString('en-IN')}
            </span>
            <span className="text-xs" style={{ color: '#bab0c1' }}>
              ₹{minWithdrawal.toLocaleString('en-IN')} goal
            </span>
          </div>
        </div>
      ) : (
        /* Withdrawal form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium flex items-center justify-between"
              style={{ color: '#000' }}
            >
              <span>Amount (₹)</span>
              <span style={{ color: '#bab0c1' }}>
                max ₹{balance.toLocaleString('en-IN')}
              </span>
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                style={{ color: '#bab0c1' }}
              >
                ₹
              </span>
              <input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minWithdrawal}
                max={balance}
                step="1"
                placeholder={String(minWithdrawal)}
                className={inputCls}
                style={{ ...inputStyle, paddingLeft: '1.75rem' }}
                onFocus={ringFocus}
                onBlur={ringBlur}
              />
            </div>
          </div>

          {/* UPI ID */}
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: '#000' }}
            >
              UPI ID
            </label>
            <input
              id="withdraw-upi"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className={inputCls}
              style={inputStyle}
              onFocus={ringFocus}
              onBlur={ringBlur}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#dc2626' }}>
              {error}
            </p>
          )}

          <button
            id="withdraw-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white text-sm font-semibold transition cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#6040d1' }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#655baa'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#6040d1'
            }}
          >
            {loading ? 'Submitting…' : 'Request Withdrawal'}
          </button>
        </form>
      )}
    </div>
  )
}
