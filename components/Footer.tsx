import Link from 'next/link'
import { getSiteConfig } from '@/lib/config'

export default async function Footer() {
  const siteConfig = await getSiteConfig()

  return (
    <footer
      className="border-t pt-12 pb-8 px-4 text-base mt-16"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      <div
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b"
        style={{ borderColor: '#f2f3fb' }}
      >
        {/* Col 1: Brand & Tagline */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: siteConfig.primaryColor, textDecoration: 'none' }}
          >
            <span>{siteConfig.siteLogoEmoji}</span> {siteConfig.siteName}
          </Link>
          <p className="text-sm leading-relaxed" style={{ color: '#bab0c1' }}>
            {siteConfig.siteTagline}
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] bg-green-50 px-3 py-1 rounded-full w-fit border border-green-200">
            <span>🛡️</span> Verified Affiliate Partner
          </div>
        </div>

        {/* Col 2: Platform & Guides */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black">Company</h4>
          <Link href="/about" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            About Us
          </Link>
          <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            How It Works &amp; FAQ
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            Contact Support
          </Link>
        </div>

        {/* Col 3: Legal & Compliance */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black">Legal &amp; Compliance</h4>
          <Link href="/affiliate-disclosure" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            Affiliate Disclosure (FTC)
          </Link>
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </div>

        {/* Col 4: Quick Actions */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black">Community</h4>
          <Link href="/post" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            + Post a Deal
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            Refer &amp; Earn
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-[#6040d1] transition-colors" style={{ textDecoration: 'none' }}>
            User Dashboard
          </Link>
        </div>
      </div>

      {/* Bottom row */}
      <div
        className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm"
        style={{ color: '#bab0c1' }}
      >
        <p>{siteConfig.copyrightText}</p>
        <p className="flex items-center gap-4">
          <span>Amazon Associate</span>
          <span>·</span>
          <span>Flipkart Partner</span>
          <span>·</span>
          <span>Meesho Affiliate</span>
        </p>
      </div>
    </footer>
  )
}
