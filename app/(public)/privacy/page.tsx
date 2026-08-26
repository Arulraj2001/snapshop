import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — snapShop',
  description: 'Privacy Policy and data protection terms for snapShop users and visitors.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: 'rgba(96,64,209,0.1)', color: '#6040d1' }}>
          Legal Terms
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ color: '#000000' }}>
          Privacy Policy 🔒
        </h1>
        <p className="text-xs mb-6" style={{ color: '#bab0c1' }}>
          Last Updated: August 2026
        </p>

        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4b5563' }}>
          <p>
            At <strong>snapShop</strong>, accessible from https://snapshop.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by snapShop and how we use it.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">1. Information We Collect</h2>
          <p>
            When you register for an account on snapShop, we collect your full name, email address, password hash, and referral code. When you request earnings withdrawals, we collect your UPI ID or bank payment details solely for processing payouts.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, operate, and maintain our deal platform.</li>
            <li>Track referral rewards and calculate community user earnings.</li>
            <li>Process withdrawal requests to your designated UPI/Bank account.</li>
            <li>Prevent fraud, abusive referral tactics, and spam submissions.</li>
          </ul>

          <h2 className="text-base font-bold text-black mt-6 mb-2">3. Cookies and Referral Tracking</h2>
          <p>
            snapShop uses cookies (`snapshop_ref`) to store referral information when visitors arrive via a referral link. Third-party partner stores (Amazon, Flipkart, Myntra, Meesho) may also set cookies to attribute affiliate link purchases.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">4. Data Protection &amp; Security</h2>
          <p>
            We implement strict security measures including database row-level security (RLS) policies and encrypted authentication sessions powered by Supabase. Your passwords and payment credentials are never stored in plain text.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">5. Contact Privacy Officer</h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>privacy@snapshop.com</strong>.
          </p>
        </div>
      </div>
    </main>
  )
}
