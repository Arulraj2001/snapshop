import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'snapShop — Sign In',
  description: 'Sign in or create your snapShop account.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{ backgroundColor: '#f2f3fb' }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Logo */}
      <a
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{ color: '#6040d1', textDecoration: 'none' }}
      >
        snapShop
      </a>

      {children}
    </div>
  )
}
