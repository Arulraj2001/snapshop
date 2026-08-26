import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'snapShop — Best Affiliate Deals',
  description: 'Discover and share the best affiliate deals on Amazon, Flipkart, Meesho & Myntra.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      <div>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {children}
      </div>
      <Footer />
    </div>
  )
}
