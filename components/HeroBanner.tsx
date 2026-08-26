'use client'

import Link from 'next/link'
import StoreLogo from './StoreLogo'

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
  stat3Val = '₹50 Bonus',
  stat3Lbl = 'Per Referral',
  gradientStart = 'var(--site-hero-gradient-from, var(--site-primary-color, #6040d1))',
  gradientEnd = 'var(--site-hero-gradient-to, var(--site-secondary-color, #9f2089))',
}: HeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl mb-6 p-6 sm:p-8 lg:p-10 text-white shadow-xl transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
      }}
    >
      {/* Background glowing ambient light spheres */}
      <div
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-25 pointer-events-none blur-3xl"
        style={{ backgroundColor: '#ffffff' }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ backgroundColor: '#ff3f6c' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ backgroundColor: '#ff9900' }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Copy, CTAs, and Stats */}
        <div className="max-w-xl w-full">
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

        {/* Right Column: Floating Rich Visual Elements (Desktop / Large Viewports) */}
        <div className="hidden lg:block relative w-80 xl:w-96 shrink-0 h-64">
          {/* Floating Card 1: Verified Deal Alert */}
          <div
            className="absolute top-0 right-2 w-72 rounded-2xl p-4 border border-white/25 bg-white/15 backdrop-blur-xl shadow-2xl animate-hero-float"
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ⚡ Hot Price Drop
              </span>
              <span className="text-[10px] font-bold text-white/80">Just Now</span>
            </div>

            <p className="text-xs font-bold text-white line-clamp-1 mb-1">
              Apple AirPods Pro (2nd Gen)
            </p>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-base font-black text-white">₹18,990</span>
              <span className="text-xs line-through text-white/60">₹24,900</span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                24% OFF
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10px] text-white/80">
              <span className="flex items-center gap-1.5 font-semibold">
                <StoreLogo logoUrl="/stores/amazon.png" name="Amazon" fallbackEmoji="📦" size={18} />
                Amazon Verified
              </span>
              <span className="text-amber-300 font-bold">🔥 42 Clicks</span>
            </div>
          </div>

          {/* Floating Card 2: Instant Payout Notification */}
          <div
            className="absolute bottom-1 left-0 w-72 rounded-2xl p-3.5 border border-white/25 bg-white/20 backdrop-blur-xl shadow-2xl animate-hero-float-slow"
            style={{
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center text-sm shadow-md shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-snug truncate">
                  Rahul K. claimed payout!
                </p>
                <p className="text-[10px] text-white/80 font-medium truncate">
                  ₹500 Transferred to UPI 💸
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-black shrink-0 shadow-xs">
                Paid ✓
              </span>
            </div>
          </div>

          {/* Floating Store Pill Badges (Using Real Logos with Enlarged Icon Size) */}
          <div className="absolute -top-3 left-4 rounded-full px-3.5 py-1.5 bg-white/25 backdrop-blur-md border border-white/35 text-xs font-bold text-white shadow-xl flex items-center gap-2 animate-pulse">
            <StoreLogo logoUrl="/stores/amazon.png" name="Amazon" fallbackEmoji="📦" size={24} />
            <span>Amazon</span>
          </div>

          <div className="absolute top-24 -right-4 rounded-full px-3.5 py-1.5 bg-blue-600/40 backdrop-blur-md border border-white/35 text-xs font-bold text-white shadow-xl flex items-center gap-2">
            <StoreLogo logoUrl="/stores/flipkart.png" name="Flipkart" fallbackEmoji="⚡" size={24} />
            <span>Flipkart</span>
          </div>

          <div className="absolute -bottom-3 right-4 rounded-full px-3.5 py-1.5 bg-pink-600/40 backdrop-blur-md border border-white/35 text-xs font-bold text-white shadow-xl flex items-center gap-2">
            <StoreLogo logoUrl="/stores/myntra.png" name="Myntra" fallbackEmoji="💄" size={24} />
            <span>Myntra</span>
          </div>
        </div>
      </div>
    </div>
  )
}
