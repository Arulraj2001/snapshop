import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — snapShop',
  description: 'Terms of Service and user conduct guidelines for snapShop.',
}

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: 'rgba(96,64,209,0.1)', color: '#6040d1' }}>
          Legal Agreement
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ color: '#000000' }}>
          Terms of Service 📜
        </h1>
        <p className="text-xs mb-6" style={{ color: '#bab0c1' }}>
          Last Updated: August 2026
        </p>

        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4b5563' }}>
          <p>
            Welcome to <strong>snapShop</strong>. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">1. Account Registration &amp; Security</h2>
          <p>
            You must be at least 18 years old to create an account and participate in withdrawal payouts. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">2. Deal Submission Rules</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submissions must contain valid URLs from supported stores (Amazon, Flipkart, Myntra, Meesho).</li>
            <li>Misleading deal titles, fake discount percentages, or expired offers will be rejected.</li>
            <li>Users attempting to post malicious links or unauthorized scripts will face permanent account suspension.</li>
          </ul>

          <h2 className="text-base font-bold text-black mt-6 mb-2">3. Referral Program &amp; Anti-Fraud</h2>
          <p>
            Self-referrals, automated bot registrations, or creating multiple accounts to farm referral commissions are strictly prohibited. snapShop reserves the right to freeze accounts and forfeit balances associated with fraudulent activities.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">4. Payouts &amp; Withdrawals</h2>
          <p>
            Payouts are processed to verified UPI IDs or Bank accounts. Minimum payout threshold is ₹100. Processing times typically range from 24 to 72 business hours upon admin approval.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">5. Limitation of Liability</h2>
          <p>
            snapShop does not sell products directly. Product availability, shipping, returns, and warranties are handled entirely by the respective partner merchant (Amazon, Flipkart, Myntra, Meesho).
          </p>
        </div>
      </div>
    </main>
  )
}
