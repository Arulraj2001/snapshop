import type { Metadata } from 'next'
import { getSiteConfig } from '@/lib/config'
import ThemeCustomizer from '@/components/admin/ThemeCustomizer'

export const metadata: Metadata = {
  title: 'snapShop Admin — Theme & Styling',
  description: 'Customize global theme colors, brand accents, and visual appearance.',
}

export default async function AdminThemePage() {
  const siteConfig = await getSiteConfig()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-black">Theme &amp; Appearance 🎨</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize website brand colors, background tints, and hero gradient theme across the entire platform.
        </p>
      </div>

      <ThemeCustomizer initialConfig={siteConfig} />
    </div>
  )
}
