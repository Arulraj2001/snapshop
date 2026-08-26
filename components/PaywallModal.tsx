'use client'

import { useState, useCallback } from 'react'

// Inline type declaration for Razorpay client-side checkout script
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open(): void
    }
  }
}

interface PaywallModalProps {
  platformFee?: number
  onClose: () => void
  onSuccess: () => void
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaywallModal({
  platformFee = 249,
  onClose,
  onSuccess,
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load payment gateway. Try again.')

      // 2. Create order on our server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Could not create order')

      setLoading(false)

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'snapShop',
        description: 'Platform Fee — Unlimited Posts',
        order_id: orderData.orderId,
        theme: { color: '#6040d1' },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          // 4. Verify payment on server
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.error)
            // 5. Success
            onSuccess()
          } catch (e: unknown) {
            setError(
              e instanceof Error ? e.message : 'Payment verification failed'
            )
          }
        },
      })

      rzp.open()
    } catch (e: unknown) {
      setLoading(false)
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }, [onSuccess])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-xl border p-6"
        style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
      >
        {/* Close */}
        <button
          id="paywall-close"
          onClick={onClose}
          className="absolute top-4 right-4 text-lg leading-none cursor-pointer"
          style={{ color: '#bab0c1', background: 'none', border: 'none' }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="text-3xl mb-1">🚀</div>

        {/* Title */}
        <h2 className="text-lg font-semibold" style={{ color: '#000' }}>
          Unlock Unlimited Posts
        </h2>
        <p className="text-sm mt-1" style={{ color: '#bab0c1' }}>
          You&apos;ve used all {platformFee === 249 ? '10' : ''} free posts. Pay a
          one-time fee to post unlimited deals.
        </p>

        {/* Price */}
        <div className="mt-4">
          <p className="text-3xl font-bold" style={{ color: '#6040d1' }}>
            ₹{platformFee}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#bab0c1' }}>
            One-time platform fee
          </p>
        </div>

        {/* Features */}
        <ul className="mt-4 flex flex-col gap-2">
          {[
            'Unlimited product posts',
            'Keep earning referral commissions',
            'Priority deal visibility',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <span style={{ color: '#6040d1', fontWeight: 700 }}>✓</span>
              <span style={{ color: '#000' }}>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <p className="text-xs mt-3" style={{ color: '#dc2626' }}>
            {error}
          </p>
        )}

        {/* Pay button */}
        <button
          id="paywall-pay-btn"
          onClick={handlePay}
          disabled={loading}
          className="mt-6 w-full py-2.5 rounded-lg text-white font-semibold text-sm transition cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#6040d1' }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#655baa'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#6040d1'
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Processing…
            </span>
          ) : (
            `Pay ₹${platformFee} & Unlock`
          )}
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
