'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: '◈' },
  { href: '/admin/products', label: 'Products', icon: '🛍️' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/referrals', label: 'Referrals', icon: '🔗' },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: '💸' },
  { href: '/admin/messages', label: 'Messages', icon: '💬' },
  { href: '/admin/theme', label: 'Theme & Styling', icon: '🎨' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

function NavContent({
  onNavClick,
}: {
  onNavClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2">
        <span className="text-lg font-bold" style={{ color: '#6040d1' }}>
          snapShop
        </span>
        <span
          className="text-xs font-semibold rounded px-1.5 py-0.5 text-white"
          style={{ backgroundColor: '#6040d1' }}
        >
          Admin
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          // Exact match for /admin, prefix match for subroutes
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`admin-nav-${item.label.toLowerCase()}`}
              onClick={onNavClick}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
              style={{
                backgroundColor: active
                  ? 'rgba(96,64,209,0.1)'
                  : 'transparent',
                color: active ? '#6040d1' : '#000',
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.backgroundColor = '#f2f3fb'
              }}
              onMouseLeave={(e) => {
                if (!active)
                  e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: back to site & sign out */}
      <div className="px-3 pb-5 flex flex-col gap-1 border-t pt-3" style={{ borderColor: '#f2f3fb' }}>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
          style={{ color: '#bab0c1', textDecoration: 'none' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#f2f3fb')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'transparent')
          }
        >
          <span>←</span> Back to site
        </Link>
        <button
          type="button"
          onClick={async () => {
            if (onNavClick) onNavClick()
            const supabase = (await import('@/lib/supabase/client')).createClient()
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer text-left w-full"
          style={{ color: '#dc2626', background: 'none', border: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  )
}

export default function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode
  adminName: string
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2f3fb' }}>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 border-r"
        style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc', zIndex: 40 }}
      >
        <NavContent />
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: '#6040d1' }}>
            snapShop
          </span>
          <span
            className="text-xs font-semibold rounded px-1.5 py-0.5 text-white"
            style={{ backgroundColor: '#6040d1' }}
          >
            Admin
          </span>
        </div>
        <button
          id="admin-menu-toggle"
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 rounded-lg cursor-pointer"
          style={{ color: '#000' }}
          aria-label="Open menu"
        >
          {/* Hamburger */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 md:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 h-full w-64 z-50 md:hidden flex flex-col border-r"
            style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
          >
            {/* Close button */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 text-xl cursor-pointer"
              style={{ color: '#bab0c1', background: 'none', border: 'none' }}
              aria-label="Close menu"
            >
              ✕
            </button>
            <NavContent onNavClick={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="md:ml-56 p-4 md:p-6">
        {/* Admin badge & logout row */}
        <div className="flex items-center justify-between mb-6">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#bab0c1' }}>
              Signed in as
            </span>
            <span
              className="text-xs font-semibold rounded-full px-2.5 py-1"
              style={{
                backgroundColor: 'rgba(96,64,209,0.1)',
                color: '#6040d1',
              }}
            >
              {adminName}
            </span>
            <button
              type="button"
              id="admin-top-signout-btn"
              onClick={async () => {
                const supabase = (await import('@/lib/supabase/client')).createClient()
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition"
              style={{ borderColor: '#d7d5dc', color: '#dc2626', backgroundColor: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Sign Out
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
