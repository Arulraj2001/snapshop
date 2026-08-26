'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#f2f3fb' }}
    >
      <div
        className="max-w-md w-full rounded-xl border p-8 text-center"
        style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
      >
        <div className="text-4xl mb-3">⚠️</div>
        <h1 className="text-lg font-semibold" style={{ color: '#000000' }}>
          Something went wrong
        </h1>
        <p className="text-sm mt-2" style={{ color: '#bab0c1' }}>
          An unexpected error occurred. Please try again or navigate back to the homepage.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="py-2 px-4 rounded-lg text-sm font-semibold text-white transition cursor-pointer"
            style={{ backgroundColor: '#6040d1', border: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#655baa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6040d1'
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="py-2 px-4 rounded-lg text-sm font-medium border text-center transition"
            style={{
              borderColor: '#d7d5dc',
              color: '#000000',
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
