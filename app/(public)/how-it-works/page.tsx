import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works & FAQ — snapShop',
  description: 'Learn how to find deals, post affiliate links, and earn referral commissions on snapShop.',
}

export default function HowItWorksPage() {
  const faqs = [
    {
      q: 'How do I earn money on snapShop?',
      a: 'You can earn in two ways: 1) Post genuine affiliate deals from Amazon, Flipkart, Meesho, or Myntra. 2) Share your unique referral link with friends. You earn ₹100 for every qualified friend who registers!',
    },
    {
      q: 'How do affiliate links work?',
      a: 'When a user clicks on a deal link on snapShop and makes a purchase on the target store (e.g. Amazon), the partner store awards a commission. snapShop shares commissions with top deal contributors.',
    },
    {
      q: 'How do I withdraw my earnings?',
      a: 'Go to your Dashboard -> Withdraw. Once your wallet balance reaches the minimum threshold of ₹100, submit your UPI ID or Bank Details for instant payout processing.',
    },
    {
      q: 'Why was my submitted deal rejected?',
      a: 'Deals are reviewed by our moderation team. Rejections occur if the deal URL is invalid, price is incorrect, product is out of stock, or duplicate deal already exists.',
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: 'rgba(96,64,209,0.1)', color: '#6040d1' }}>
          Guide &amp; FAQ
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6" style={{ color: '#000000' }}>
          How snapShop Works 🚀
        </h1>

        {/* 3 Step Guide */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl border relative" style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff' }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3" style={{ backgroundColor: '#6040d1' }}>
              1
            </span>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#000000' }}>Find or Post Deals</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#bab0c1' }}>Browse price drops or submit product deal links from Amazon, Flipkart, Myntra &amp; Meesho.</p>
          </div>

          <div className="p-5 rounded-xl border relative" style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff' }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3" style={{ backgroundColor: '#6040d1' }}>
              2
            </span>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#000000' }}>Verification &amp; Clicks</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#bab0c1' }}>Deals are approved by admins. Community members click and purchase deals via affiliate links.</p>
          </div>

          <div className="p-5 rounded-xl border relative" style={{ borderColor: '#d7d5dc', backgroundColor: '#ffffff' }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3" style={{ backgroundColor: '#6040d1' }}>
              3
            </span>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#000000' }}>Get Paid</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#bab0c1' }}>Earn referral commissions and cash rewards credited directly to your UPI wallet.</p>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <h2 className="text-xl font-bold mb-4 pt-4 border-t" style={{ color: '#000000', borderColor: '#f2f3fb' }}>
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-xl border" style={{ borderColor: '#f2f3fb', backgroundColor: '#fafafa' }}>
              <h4 className="font-semibold text-sm mb-1.5" style={{ color: '#000000' }}>
                {f.q}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t flex items-center justify-between" style={{ borderColor: '#f2f3fb' }}>
          <span className="text-xs" style={{ color: '#bab0c1' }}>Have more questions?</span>
          <Link href="/contact" className="text-xs font-bold text-[#6040d1] hover:underline">
            Contact Support →
          </Link>
        </div>
      </div>
    </main>
  )
}
