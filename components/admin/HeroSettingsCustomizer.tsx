'use client'

import { useState } from 'react'
import HeroBanner from '@/components/HeroBanner'

interface HeroSettingsProps {
  initialConfig: {
    hero_badge_text?: string
    hero_headline?: string
    hero_subtitle?: string
    hero_stat_1_val?: string
    hero_stat_1_lbl?: string
    hero_stat_2_val?: string
    hero_stat_2_lbl?: string
    hero_stat_3_val?: string
    hero_stat_3_lbl?: string
    site_hero_gradient_from?: string
    site_hero_gradient_to?: string
  }
}

export default function HeroSettingsCustomizer({ initialConfig }: HeroSettingsProps) {
  const [badgeText, setBadgeText] = useState(
    initialConfig.hero_badge_text || "🔥 India's #1 Community Deal Hub"
  )
  const [headline, setHeadline] = useState(
    initialConfig.hero_headline || 'Discover & Share Craziest Price Drops'
  )
  const [subtitle, setSubtitle] = useState(
    initialConfig.hero_subtitle ||
      'Hand-picked discounts on Amazon, Flipkart, Myntra & Meesho. Post deals to earn rewards or refer friends to claim rewards!'
  )
  const [stat1Val, setStat1Val] = useState(initialConfig.hero_stat_1_val || '5,000+')
  const [stat1Lbl, setStat1Lbl] = useState(initialConfig.hero_stat_1_lbl || 'Verified Deals')

  const [stat2Val, setStat2Val] = useState(initialConfig.hero_stat_2_val || '⚡ Real-time')
  const [stat2Lbl, setStat2Lbl] = useState(initialConfig.hero_stat_2_lbl || 'Price Drops')

  const [stat3Val, setStat3Val] = useState(initialConfig.hero_stat_3_val || '₹50 Bonus')
  const [stat3Lbl, setStat3Lbl] = useState(initialConfig.hero_stat_3_lbl || 'Per Referral')

  const [fromColor, setFromColor] = useState(initialConfig.site_hero_gradient_from || '#6040d1')
  const [toColor, setToColor] = useState(initialConfig.site_hero_gradient_to || '#9f2089')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSaveAll() {
    setSaving(true)
    setMessage(null)

    const items = [
      { key: 'hero_badge_text', value: badgeText },
      { key: 'hero_headline', value: headline },
      { key: 'hero_subtitle', value: subtitle },
      { key: 'hero_stat_1_val', value: stat1Val },
      { key: 'hero_stat_1_lbl', value: stat1Lbl },
      { key: 'hero_stat_2_val', value: stat2Val },
      { key: 'hero_stat_2_lbl', value: stat2Lbl },
      { key: 'hero_stat_3_val', value: stat3Val },
      { key: 'hero_stat_3_lbl', value: stat3Lbl },
      { key: 'site_hero_gradient_from', value: fromColor },
      { key: 'site_hero_gradient_to', value: toColor },
      { key: 'site_hero_gradient_start', value: fromColor },
      { key: 'site_hero_gradient_end', value: toColor },
    ]

    try {
      for (const item of items) {
        const res = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to save settings')
        }
      }

      setMessage({ type: 'success', text: '✨ Hero banner settings saved successfully! Reloading to apply site-wide...' })
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error saving settings',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Form Controls (Left Column) */}
      <div className="flex-1 w-full flex flex-col gap-4">
        {/* Badge & Headline */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">Top Badge Text</label>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#6040d1]"
            style={{ borderColor: '#d7d5dc' }}
            placeholder="e.g. 🔥 India's #1 Community Deal Hub"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">Main Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#6040d1]"
            style={{ borderColor: '#d7d5dc' }}
            placeholder="e.g. Discover & Share Craziest Price Drops"
          />
        </div>

        {/* Subtitle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">Subtitle Description</label>
          <textarea
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#6040d1] resize-none"
            style={{ borderColor: '#d7d5dc' }}
            placeholder="Subtitle text displayed under headline"
          />
        </div>

        {/* Stats 1, 2, 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Stat 1 */}
          <div className="flex flex-col gap-1 border p-3 rounded-xl bg-slate-50" style={{ borderColor: '#f2f3fb' }}>
            <span className="text-[10px] font-bold uppercase text-gray-400">Stat 1</span>
            <input
              type="text"
              value={stat1Val}
              onChange={(e) => setStat1Val(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs font-bold text-black"
              style={{ borderColor: '#d7d5dc' }}
              placeholder="Value (e.g. 5,000+)"
            />
            <input
              type="text"
              value={stat1Lbl}
              onChange={(e) => setStat1Lbl(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs text-gray-600"
              style={{ borderColor: '#d7d5dc' }}
              placeholder="Label (e.g. Verified Deals)"
            />
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col gap-1 border p-3 rounded-xl bg-slate-50" style={{ borderColor: '#f2f3fb' }}>
            <span className="text-[10px] font-bold uppercase text-gray-400">Stat 2</span>
            <input
              type="text"
              value={stat2Val}
              onChange={(e) => setStat2Val(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs font-bold text-black"
              style={{ borderColor: '#d7d5dc' }}
              placeholder="Value (e.g. ⚡ Real-time)"
            />
            <input
              type="text"
              value={stat2Lbl}
              onChange={(e) => setStat2Lbl(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs text-gray-600"
              style={{ borderColor: '#d7d5dc' }}
              placeholder="Label (e.g. Price Drops)"
            />
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col gap-1 border p-3 rounded-xl bg-slate-50" style={{ borderColor: '#f2f3fb' }}>
            <span className="text-[10px] font-bold uppercase text-gray-400">Stat 3</span>
            <input
              type="text"
              value={stat3Val}
              onChange={(e) => setStat3Val(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs font-bold text-black"
              style={{ borderColor: '#d7d5dc' }}
              placeholder="Value (e.g. ₹50 Bonus)"
            />
            <input
              type="text"
              value={stat3Lbl}
              onChange={(e) => setStat3Lbl(e.target.value)}
              className="rounded-lg border px-2 py-1 text-xs text-gray-600"
              style={{ borderColor: '#d7d5dc' }}
              placeholder="Label (e.g. Per Referral)"
            />
          </div>
        </div>

        {/* Gradient Colors */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-black">Gradient Start Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fromColor}
                onChange={(e) => setFromColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={fromColor}
                onChange={(e) => setFromColor(e.target.value)}
                className="w-full text-xs font-mono font-bold uppercase rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: '#d7d5dc' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-black">Gradient End Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={toColor}
                onChange={(e) => setToColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={toColor}
                onChange={(e) => setToColor(e.target.value)}
                className="w-full text-xs font-mono font-bold uppercase rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: '#d7d5dc' }}
              />
            </div>
          </div>
        </div>

        {/* Save message */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-bold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="mt-2 w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: '#6040d1' }}
        >
          {saving ? 'Saving Hero Settings...' : '💾 Save Hero Banner Settings'}
        </button>
      </div>

      {/* Realtime Live Preview (Right Column) */}
      <div className="w-full lg:w-[420px] shrink-0 sticky top-6">
        <div className="rounded-2xl border p-5 bg-white shadow-sm" style={{ borderColor: '#d7d5dc' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>👁️</span> Realtime Hero Preview
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live updates
            </span>
          </div>

          <div className="border rounded-2xl p-2 bg-[#f2f3fb]" style={{ borderColor: '#d7d5dc' }}>
            <HeroBanner
              badgeText={badgeText}
              headline={headline}
              subtitle={subtitle}
              stat1Val={stat1Val}
              stat1Lbl={stat1Lbl}
              stat2Val={stat2Val}
              stat2Lbl={stat2Lbl}
              stat3Val={stat3Val}
              stat3Lbl={stat3Lbl}
              gradientStart={fromColor}
              gradientEnd={toColor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
