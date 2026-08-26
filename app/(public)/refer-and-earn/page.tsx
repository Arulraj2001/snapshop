import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  return {
    title: `Refer & Earn ₹${siteConfig.commissionAmount} — ${siteConfig.siteName}`,
    description:
      `Invite deal lovers to ${siteConfig.siteName} and earn ₹${siteConfig.commissionAmount} for every friend who joins and unlocks unlimited posting. Plus get ₹${siteConfig.welcomeBonusAmount} welcome cashback.`,
  }
}

export default async function ReferAndEarnPage() {
  const siteConfig = await getSiteConfig()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const primary = siteConfig.primaryColor || '#6040d1'
  const secondary = siteConfig.secondaryColor || '#9f2089'
  const commission = siteConfig.commissionAmount || 50
  const welcomeBonus = siteConfig.welcomeBonusAmount || 50
  const platformFee = siteConfig.platformFeeAmount || 249

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12 py-4">
      {/* Hero Banner */}
      <div
        className="rounded-3xl p-8 sm:p-12 text-white text-center shadow-lg relative overflow-hidden flex flex-col items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${siteConfig.heroGradientFrom || primary} 0%, ${siteConfig.heroGradientTo || secondary} 100%)`,
        }}
      >
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
          🎁 Unlimited Referral Rewards
        </span>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight max-w-2xl">
          Refer Friends &amp; Earn ₹{commission} Every Time!
        </h1>

        <p className="text-sm sm:text-base opacity-90 max-w-xl leading-relaxed">
          Share your referral link with deal hunters, friends, and social groups. Earn ₹{commission} cash directly in your wallet for every verified member. Plus get ₹{welcomeBonus} welcome cashback on your upgrade!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
          <Link
            href={user ? '/dashboard' : '/register'}
            className="px-8 py-3.5 rounded-2xl font-extrabold text-black bg-white shadow-md transition-all hover:scale-105 text-sm text-center"
            style={{ textDecoration: 'none' }}
          >
            {user ? 'Get Your Referral Link →' : 'Sign Up to Start Earning →'}
          </Link>
        </div>
      </div>

      {/* 4-Step How It Works */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-black">How Refer &amp; Earn Works ⚡</h2>
          <p className="text-sm text-gray-500 mt-1">Four simple steps to start receiving cash payouts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              icon: '🔓',
              title: 'Unlock Your Link',
              desc: `Pay the one-time ₹${platformFee} platform fee to unlock unlimited deal posting, get ₹${welcomeBonus} cashback in your wallet, and activate your referral link.`,
            },
            {
              step: '02',
              icon: '🔗',
              title: 'Share Your Link',
              desc: 'Copy your unique link from your Dashboard and share on WhatsApp, Telegram, YouTube & Instagram.',
            },
            {
              step: '03',
              icon: '⚡',
              title: 'Friend Joins & Pays',
              desc: `Your friend registers via your link and pays their ₹${platformFee} platform fee (they get ₹${welcomeBonus} cashback in their wallet too!).`,
            },
            {
              step: '04',
              icon: '💰',
              title: `Get Paid ₹${commission} Instant`,
              desc: `₹${commission} is automatically credited to your wallet. Request instant payout to your UPI ID once you hit minimum threshold!`,
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border p-6 bg-white shadow-xs flex flex-col justify-between"
              style={{ borderColor: '#d7d5dc' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-black text-gray-300">STEP {s.step}</span>
                </div>
                <h3 className="text-base font-extrabold text-black mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Potential Earnings Calculator */}
      <div className="rounded-3xl border p-8 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-black">💸 How Much Can You Earn?</h2>
          <p className="text-xs text-gray-400 mt-1">There is NO CAP on how many friends you can invite!</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { friends: '5 Friends', earnings: `₹${(5 * commission).toLocaleString('en-IN')}` },
            { friends: '10 Friends', earnings: `₹${(10 * commission).toLocaleString('en-IN')}` },
            { friends: '50 Friends', earnings: `₹${(50 * commission).toLocaleString('en-IN')}` },
            { friends: '100 Friends', earnings: `₹${(100 * commission).toLocaleString('en-IN')}` },
          ].map((item) => (
            <div key={item.friends} className="p-4 rounded-2xl bg-slate-50 border" style={{ borderColor: '#f2f3fb' }}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.friends}</p>
              <p className="text-2xl font-black mt-1" style={{ color: primary }}>
                {item.earnings}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-3xl border p-8 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
        <h2 className="text-xl font-extrabold text-black mb-6 flex items-center gap-2">
          <span>❓</span> Frequently Asked Questions
        </h2>

        <div className="flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-bold text-black mb-1">When is my ₹{commission} referral commission credited?</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Your referral status changes from 🟡 Pending to 🟢 Paid the instant your referred friend completes their ₹{platformFee} platform fee payment. ₹{commission} is credited automatically to your wallet.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black mb-1">Do I get cashback when I pay the platform fee?</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Yes! When you complete your ₹{platformFee} platform fee payment, ₹{welcomeBonus} is instantly credited back to your own wallet balance as a welcome cashback bonus.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black mb-1">How do I withdraw my earnings?</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Once your wallet balance reaches the minimum withdrawal threshold, go to your Dashboard, enter your UPI ID (e.g. `yourname@upi`), and click &quot;Request Withdrawal&quot;. Admin processes payouts within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div
        className="rounded-3xl p-8 text-center text-white flex flex-col items-center gap-3 shadow-md"
        style={{ backgroundColor: primary }}
      >
        <span className="text-3xl">🚀</span>
        <h2 className="text-2xl font-extrabold">Ready to Earn Extra Cash?</h2>
        <p className="text-xs sm:text-sm opacity-90 max-w-md">
          Join thousands of deal enthusiasts sharing handpicked affiliate offers and earning referral commissions every single day.
        </p>
        <Link
          href={user ? '/dashboard' : '/register'}
          className="mt-2 px-8 py-3 rounded-xl font-bold text-sm bg-white text-black shadow-sm transition-transform hover:scale-105"
          style={{ textDecoration: 'none' }}
        >
          {user ? 'Go to Dashboard →' : 'Create Free Account →'}
        </Link>
      </div>
    </div>
  )
}
