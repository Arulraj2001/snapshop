'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  siteName?: string
  siteLogoEmoji?: string
}

export default function Header({
  siteName = 'snapShop',
  siteLogoEmoji = '🛍️',
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<unknown | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setAuthChecked(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthChecked(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    return pathname + (qs ? `?${qs}` : '')
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    router.push(buildUrl({ q: q || null, store: null, category: null }))
    setSearchOpen(false)
  }

  return (
    <header
      className="sticky top-0 z-50 h-14 flex items-center px-4 gap-3"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d7d5dc',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="shrink-0 text-xl font-bold flex items-center gap-1.5"
        style={{ color: 'var(--site-primary-color, #6040d1)', textDecoration: 'none' }}
      >
        <span>{siteLogoEmoji}</span> {siteName}
      </Link>

      {/* Search — desktop */}
      <form
        onSubmit={handleSearch}
        className="hidden sm:flex flex-1 max-w-xs mx-auto"
      >
        <input
          ref={inputRef}
          defaultValue={searchParams.get('q') ?? ''}
          type="search"
          placeholder="Search deals…"
          className="w-full rounded-full px-4 py-1.5 text-sm outline-none focus:ring-2"
          style={{
            border: '1px solid #d7d5dc',
            backgroundColor: '#f2f3fb',
            color: '#000',
          }}
        />
      </form>

      {/* Spacer */}
      <div className="flex-1 sm:hidden" />

      {/* Right — mobile: icon buttons */}
      <div className="flex items-center gap-1.5 sm:hidden">
        {/* Mobile Refer & Earn Button */}
        <Link
          href="/refer-and-earn"
          id="header-refer-mobile"
          className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border shadow-xs"
          style={{
            borderColor: 'var(--site-primary-color, #6040d1)',
            color: 'var(--site-primary-color, #6040d1)',
            backgroundColor: 'rgba(96,64,209,0.06)',
            textDecoration: 'none',
          }}
        >
          <span>🎁</span> Refer
        </Link>

        <button
          id="header-search-toggle"
          aria-label="Search"
          onClick={() => {
            setSearchOpen((v) => !v)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
          className="p-1.5 rounded-lg"
          style={{ color: 'var(--site-primary-color, #6040d1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M17 17l-3.5-3.5"/></svg>
        </button>
        <Link
          href="/post"
          id="header-post-mobile"
          className="p-1.5 rounded-lg"
          style={{ color: 'var(--site-primary-color, #6040d1)' }}
          aria-label="Post a Deal"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4v12M4 10h12"/></svg>
        </Link>
      </div>

      {/* Right — desktop: text buttons */}
      <div className="hidden sm:flex items-center gap-2.5 shrink-0">
        {/* Refer & Earn Button (Always Visible) */}
        <Link
          href="/refer-and-earn"
          id="header-refer-btn"
          className="text-xs sm:text-sm rounded-lg px-3 py-1.5 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border hover:scale-102"
          style={{
            borderColor: 'var(--site-primary-color, #6040d1)',
            color: 'var(--site-primary-color, #6040d1)',
            backgroundColor: 'rgba(96,64,209,0.06)',
            textDecoration: 'none',
          }}
        >
          <span>🎁</span> Refer &amp; Earn
        </Link>

        {authChecked && (
          <>
            {user ? (
              <>
                <Link
                  href="/post"
                  id="header-post-btn"
                  className="text-xs sm:text-sm rounded-lg px-3 py-1.5 font-bold text-white transition-all shadow-2xs hover:opacity-90"
                  style={{ backgroundColor: 'var(--site-primary-color, #6040d1)', textDecoration: 'none' }}
                >
                  + Post a Deal
                </Link>
                <button
                  type="button"
                  id="header-signout-btn"
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    setUser(null)
                    window.location.href = '/login'
                  }}
                  className="text-xs sm:text-sm rounded-lg px-3 py-1.5 font-medium border transition cursor-pointer"
                  style={{
                    borderColor: '#d7d5dc',
                    color: '#dc2626',
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  id="header-login-btn"
                  className="text-xs sm:text-sm rounded-lg px-3 py-1.5 font-semibold transition"
                  style={{
                    color: '#000000',
                    textDecoration: 'none',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  id="header-register-btn"
                  className="text-xs sm:text-sm rounded-lg px-3.5 py-1.5 font-bold text-white transition shadow-2xs hover:opacity-90"
                  style={{ backgroundColor: 'var(--site-primary-color, #6040d1)', textDecoration: 'none' }}
                >
                  Register
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile search bar (expanded) */}
      {searchOpen && (
        <div
          className="absolute top-14 left-0 right-0 sm:hidden px-4 py-2"
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #d7d5dc',
          }}
        >
          <form onSubmit={handleSearch}>
            <input
              ref={inputRef}
              defaultValue={searchParams.get('q') ?? ''}
              type="search"
              placeholder="Search deals…"
              className="w-full rounded-full px-4 py-2 text-sm outline-none focus:ring-2"
              style={{
                border: '1px solid #d7d5dc',
                backgroundColor: '#f2f3fb',
                color: '#000',
              }}
            />
          </form>
        </div>
      )}
    </header>
  )
}
