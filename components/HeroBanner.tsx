'use client'

import Link from 'next/link'

interface HeroBannerProps {
  badgeText?: string
  headline?: string
  subtitle?: string
  stat1Val?: string
  stat1Lbl?: string
  stat2Val?: string
  stat2Lbl?: string
  stat3Val?: string
  stat3Lbl?: string
  gradientStart?: string
  gradientEnd?: string
}

export default function HeroBanner({
  badgeText = "🔥 India's #1 Community Deal Hub",
  headline = 'Discover & Share Craziest Price Drops',
  subtitle = 'Hand-picked discounts on Amazon, Flipkart, Myntra & Meesho. Post deals to earn rewards or refer friends to claim rewards!',
  stat1Val = '5,000+',
  stat1Lbl = 'Verified Deals',
  stat2Val = '⚡ Real-time',
  stat2Lbl = 'Price Drops',
  stat3Val = '₹100 Bonus',
  stat3Lbl = 'Per Referral',
  gradientStart = 'var(--site-hero-gradient-from, var(--site-primary-color, #6040d1))',
  gradientEnd = 'var(--site-hero-gradient-to, var(--site-secondary-color, #9f2089))',
}: HeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-6 p-6 sm:p-8 text-white shadow-lg transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
      }}
    >
      {/* Decorative background glow shapes */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-2xl"
        style={{ backgroundColor: '#ffffff' }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ backgroundColor: '#f43397' }}
      />

      <div className="relative z-10 max-w-2xl">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold mb-3 border border-white/25 bg-white/10 backdrop-blur-md shadow-2xs">
          <span>{badgeText}</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
          {headline}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/85 mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/post"
            className="rounded-xl px-5 py-2.5 text-sm font-bold bg-white transition-all shadow-md hover:scale-105"
            style={{ color: 'var(--site-primary-color, #6040d1)', textDecoration: 'none' }}
          >
            + Post a Deal
          </Link>
          <Link
            href="/refer-and-earn"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
            style={{ textDecoration: 'none' }}
          >
            Refer &amp; Earn Rewards 🎁
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-7 pt-5 border-t border-white/20 grid grid-cols-3 gap-2 text-center sm:text-left">
          <div>
            <p className="text-lg sm:text-xl font-extrabold">{stat1Val}</p>
            <p className="text-xs text-white/75 font-medium">{stat1Lbl}</p>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold">{stat2Val}</p>
            <p className="text-xs text-white/75 font-medium">{stat2Lbl}</p>
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold">{stat3Val}</p>
            <p className="text-xs text-white/75 font-medium">{stat3Lbl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
