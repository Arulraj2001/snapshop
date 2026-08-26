import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure — snapShop',
  description: 'Affiliate program disclosure statement for Amazon, Flipkart, Myntra, and Meesho links on snapShop.',
}

export default function AffiliateDisclosurePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border p-6 sm:p-10 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3" style={{ backgroundColor: 'rgba(96,64,209,0.1)', color: '#6040d1' }}>
          Compliance &amp; Transparency
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ color: '#000000' }}>
          Affiliate Program Disclosure 📢
        </h1>
        <p className="text-xs mb-6" style={{ color: '#bab0c1' }}>
          Last Updated: August 2026
        </p>

        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4b5563' }}>
          <p>
            <strong>snapShop</strong> believes in 100% transparency with our users and community members. In compliance with Federal Trade Commission (FTC) guidelines and store affiliate operating agreements, please read our disclosure regarding affiliate links across our platform.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">1. What Are Affiliate Links?</h2>
          <p>
            Some links on snapShop are affiliate links. This means that if you click on a deal button (e.g., &quot;Buy on Amazon&quot; or &quot;Buy on Flipkart&quot;) and make a purchase on the retailer&apos;s website within a specified timeframe, snapShop may receive a small referral commission at <strong>no extra cost to you</strong>.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">2. Amazon Associates Program Disclosure</h2>
          <p>
            snapShop is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in and affiliated sites.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">3. Flipkart, Myntra &amp; Meesho Affiliate Partnerships</h2>
          <p>
            snapShop also participates in affiliate programs with Flipkart Internet Private Limited, Myntra Designs, and Fashnear Technologies (Meesho). We receive affiliate compensation for qualified referral purchases generated from deal links hosted on our site.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">4. Price Guarantee for Buyers</h2>
          <p>
            The price you pay for products purchased via snapShop affiliate links is exactly the same as (or lower than) the regular price on the retailer&apos;s site. Using our affiliate links never increases the price you pay.
          </p>

          <h2 className="text-base font-bold text-black mt-6 mb-2">5. Editorial Independence &amp; User Submissions</h2>
          <p>
            Deals featured on snapShop are submitted by users and curated by our moderation team based solely on discount value, price history, and stock availability. Affiliate commissions do not influence our deal approval standards.
          </p>
        </div>
      </div>
    </main>
  )
}
