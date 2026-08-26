import type { Metadata, Viewport } from 'next'
import './globals.css'
import Toast from '@/components/Toast'
import ThemeInjector from '@/components/ThemeInjector'

export const metadata: Metadata = {
  title: 'snapShop — Best Affiliate Deals',
  description:
    'Discover and share the best deals on Amazon, Flipkart, Meesho and Myntra. Earn by referring friends.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'snapShop',
    description: 'Best affiliate deals shared by the community',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#6040d1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <ThemeInjector />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toast />
      </body>
    </html>
  )
}
