import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Suspended — snapShop',
}

export default function BannedPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#f2f3fb' }}
    >
      <div
        className="max-w-md w-full rounded-xl border p-8 text-center"
        style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
      >
        <div className="text-4xl mb-3">🚫</div>
        <h1 className="text-xl font-bold" style={{ color: '#dc2626' }}>
          Account Suspended
        </h1>
        <p className="text-sm mt-3" style={{ color: '#000000' }}>
          Your account has been suspended for violating our platform guidelines.
        </p>
        <p className="text-xs mt-2" style={{ color: '#bab0c1' }}>
          Contact support if you think this is a mistake.
        </p>
      </div>
    </div>
  )
}
