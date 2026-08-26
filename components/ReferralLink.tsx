'use client'

import { useState } from 'react'

interface ReferralLinkCardProps {
  link: string
  commissionAmount: number
}

export default function ReferralLinkCard({
  link,
  commissionAmount,
}: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => flash())
    } else {
      // Fallback for older / iOS browsers
      const el = document.createElement('textarea')
      el.value = link
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      flash()
    }
  }

  function flash() {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl border p-4 mb-4"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      <p className="font-semibold text-sm" style={{ color: '#000' }}>
        Your Referral Link
      </p>
      <p className="text-xs mt-0.5" style={{ color: '#bab0c1' }}>
        Earn ₹{commissionAmount.toLocaleString('en-IN')} for every user who
        joins and pays via your link
      </p>

      <div className="flex items-center gap-2 mt-3">
        {/* Link display */}
        <div
          className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm truncate select-all"
          style={{
            backgroundColor: '#f2f3fb',
            borderColor: '#d7d5dc',
            color: '#655baa',
          }}
        >
          {link}
        </div>

        {/* Copy button */}
        <button
          id="referral-copy-btn"
          onClick={handleCopy}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition cursor-pointer"
          style={{
            backgroundColor: copied ? '#655baa' : '#6040d1',
            minWidth: '72px',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
