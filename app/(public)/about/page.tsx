import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us — snapShop',
  description: "Learn about snapShop, India's premier community-driven affiliate deal sharing platform.",
}

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: 'rgba(96,64,209,0.1)', color: '#6040d1' }}>
          About snapShop
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ color: '#000000' }}>
          Connecting Deal Hunters Across India 🛍️
        </h1>
        <p className="text-base leading-relaxed mb-6" style={{ color: '#4b5563' }}>
          snapShop is India&apos;s leading community-driven affiliate deal platform. We empower shoppers to discover verified price drops across major online retailers including Amazon, Flipkart, Myntra, and Meesho while giving deal enthusiasts a platform to earn rewards by sharing hand-picked offers.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 my-8">
          <div className="p-4 rounded-xl border" style={{ borderColor: '#f2f3fb', backgroundColor: '#fafafa' }}>
            <span className="text-2xl mb-2 block">🔥</span>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#000000' }}>Verified Deals</h3>
            <p className="text-xs" style={{ color: '#bab0c1' }}>Every post is moderated to guarantee real price drops and authentic savings.</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: '#f2f3fb', backgroundColor: '#fafafa' }}>
            <span className="text-2xl mb-2 block">💰</span>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#000000' }}>Community Earnings</h3>
            <p className="text-xs" style={{ color: '#bab0c1' }}>Post deals and refer friends to earn real cash rewards directly into your UPI wallet.</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ borderColor: '#f2f3fb', backgroundColor: '#fafafa' }}>
            <span className="text-2xl mb-2 block">⚡</span>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#000000' }}>Real-time Drops</h3>
            <p className="text-xs" style={{ color: '#bab0c1' }}>Instant notifications on lightning deals, festive sales, and price crashes.</p>
          </div>
        </div>

        <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: '#000000' }}>
          Our Mission
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#4b5563' }}>
          Our goal is simple: ensure no Indian online shopper ever pays full price. By combining crowd-sourced deal discovery with affiliate monetization, we create a win-win ecosystem for deal lovers and bargain hunters alike.
        </p>

        <div className="mt-8 pt-6 border-t flex flex-wrap gap-4" style={{ borderColor: '#f2f3fb' }}>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs"
            style={{ backgroundColor: '#6040d1', textDecoration: 'none' }}
          >
            Join snapShop Free
          </Link>
          <Link
            href="/how-it-works"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: '#d7d5dc', color: '#000000', textDecoration: 'none' }}
          >
            How It Works →
          </Link>
        </div>
      </div>
    </main>
  )
}
