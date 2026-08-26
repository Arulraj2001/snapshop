'use client'

import { useState } from 'react'

interface ThemeCustomizerProps {
  initialConfig: {
    primaryColor: string
    secondaryColor: string
    bgColor: string
    heroGradientFrom: string
    heroGradientTo: string
  }
}

const PRESETS = [
  {
    name: 'Royal Purple (Default)',
    icon: '🟣',
    primary: '#6040d1',
    secondary: '#9f2089',
    bg: '#f2f3fb',
    from: '#6040d1',
    to: '#9f2089',
  },
  {
    name: 'Electric Indigo',
    icon: '🔵',
    primary: '#2563eb',
    secondary: '#0284c7',
    bg: '#f0f6ff',
    from: '#2563eb',
    to: '#0284c7',
  },
  {
    name: 'Emerald Mint',
    icon: '🟢',
    primary: '#059669',
    secondary: '#0d9488',
    bg: '#ecfdf5',
    from: '#059669',
    to: '#0d9488',
  },
  {
    name: 'Crimson Flame',
    icon: '🔴',
    primary: '#dc2626',
    secondary: '#e11d48',
    bg: '#fff1f2',
    from: '#dc2626',
    to: '#e11d48',
  },
  {
    name: 'Amber Sunset',
    icon: '🟠',
    primary: '#d97706',
    secondary: '#ea580c',
    bg: '#fffbeb',
    from: '#d97706',
    to: '#ea580c',
  },
]

export default function ThemeCustomizer({ initialConfig }: ThemeCustomizerProps) {
  const [primary, setPrimary] = useState(initialConfig.primaryColor || '#6040d1')
  const [secondary, setSecondary] = useState(initialConfig.secondaryColor || '#9f2089')
  const [bg, setBg] = useState(initialConfig.bgColor || '#f2f3fb')
  const [from, setFrom] = useState(initialConfig.heroGradientFrom || initialConfig.primaryColor || '#6040d1')
  const [to, setTo] = useState(initialConfig.heroGradientTo || initialConfig.secondaryColor || '#9f2089')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function applyPreset(p: (typeof PRESETS)[number]) {
    setPrimary(p.primary)
    setSecondary(p.secondary)
    setBg(p.bg)
    setFrom(p.from)
    setTo(p.to)
  }

  async function saveTheme() {
    setSaving(true)
    setMessage(null)

    const items = [
      { key: 'site_primary_color', value: primary },
      { key: 'site_secondary_color', value: secondary },
      { key: 'site_bg_color', value: bg },
      { key: 'site_hero_gradient_from', value: from },
      { key: 'site_hero_gradient_to', value: to },
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
          throw new Error(data.error || 'Failed to save theme settings')
        }
      }

      setMessage({ type: 'success', text: '✨ Theme settings saved successfully! Reloading pages to apply...' })
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred while saving theme settings',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl">
      {/* Controls Column */}
      <div className="flex-1 w-full flex flex-col gap-6">
        {/* Preset Palettes Card */}
        <div className="rounded-2xl border p-6 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-3">
            🎨 Preset Color Palettes
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Click any theme preset below to instantly apply curated color combinations across the website.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESETS.map((p) => {
              const active = primary === p.primary && secondary === p.secondary && bg === p.bg
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: active ? p.primary : '#d7d5dc',
                    backgroundColor: active ? `${p.primary}0D` : '#ffffff',
                    borderWidth: active ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-black">{p.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: p.primary }} />
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: p.secondary }} />
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: p.bg }} />
                      </div>
                    </div>
                  </div>
                  {active && <span className="text-xs font-bold" style={{ color: p.primary }}>Active ✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Color Pickers Card */}
        <div className="rounded-2xl border p-6 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-3">
            ⚙️ Fine-Tune Theme Colors
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Manually pick exact hex codes to match your brand identity.
          </p>

          <div className="flex flex-col gap-4">
            {/* Primary Color */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: '#f2f3fb' }}>
              <div>
                <label className="text-xs font-bold text-black block">Primary Brand Color</label>
                <span className="text-xs text-gray-400">Buttons, active tabs, highlight icons &amp; primary links</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="w-20 rounded-lg border px-2 py-1 text-xs font-mono font-bold uppercase"
                  style={{ borderColor: '#d7d5dc' }}
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: '#f2f3fb' }}>
              <div>
                <label className="text-xs font-bold text-black block">Secondary Accent Color</label>
                <span className="text-xs text-gray-400">Store pill badges, secondary buttons &amp; accent gradients</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  className="w-20 rounded-lg border px-2 py-1 text-xs font-mono font-bold uppercase"
                  style={{ borderColor: '#d7d5dc' }}
                />
              </div>
            </div>

            {/* Background Tint */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: '#f2f3fb' }}>
              <div>
                <label className="text-xs font-bold text-black block">Website Page Background</label>
                <span className="text-xs text-gray-400">Overall body &amp; page wrapper background color</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-20 rounded-lg border px-2 py-1 text-xs font-mono font-bold uppercase"
                  style={{ borderColor: '#d7d5dc' }}
                />
              </div>
            </div>

            {/* Hero Gradient From */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: '#f2f3fb' }}>
              <div>
                <label className="text-xs font-bold text-black block">Hero Gradient Start</label>
                <span className="text-xs text-gray-400">Top left color of homepage banner</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-20 rounded-lg border px-2 py-1 text-xs font-mono font-bold uppercase"
                  style={{ borderColor: '#d7d5dc' }}
                />
              </div>
            </div>

            {/* Hero Gradient To */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: '#f2f3fb' }}>
              <div>
                <label className="text-xs font-bold text-black block">Hero Gradient End</label>
                <span className="text-xs text-gray-400">Bottom right color of homepage banner</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-20 rounded-lg border px-2 py-1 text-xs font-mono font-bold uppercase"
                  style={{ borderColor: '#d7d5dc' }}
                />
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs font-bold ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            id="theme-save-btn"
            onClick={saveTheme}
            disabled={saving}
            className="mt-6 w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            {saving ? 'Saving Theme...' : '💾 Save & Apply Theme Site-Wide'}
          </button>
        </div>
      </div>

      {/* Live Preview Column */}
      <div className="w-full lg:w-[380px] shrink-0 sticky top-6">
        <div className="rounded-2xl border p-5 bg-white shadow-sm" style={{ borderColor: '#d7d5dc' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1 flex items-center justify-between">
            <span>👁️ Live UI Preview</span>
            <span className="text-[10px] font-normal text-gray-400">Updates Realtime</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Preview how your site looks with these theme colors:</p>

          {/* Canvas Wrapper with background tint */}
          <div className="rounded-xl p-4 flex flex-col gap-4 border" style={{ backgroundColor: bg, borderColor: '#d7d5dc' }}>
            {/* Header Preview */}
            <div className="bg-white rounded-xl p-3 border shadow-xs flex items-center justify-between" style={{ borderColor: '#d7d5dc' }}>
              <div className="flex items-center gap-2">
                <span className="text-base">🛍️</span>
                <span className="font-extrabold text-sm text-black">snapShop</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: primary }}>
                + Post Deal
              </span>
            </div>

            {/* Hero Banner Preview */}
            <div
              className="rounded-xl p-4 text-white shadow-xs"
              style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
            >
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20">
                🔥 Hot Deals Every Day
              </span>
              <p className="text-sm font-extrabold mt-2">Find the Best Online Deals</p>
              <p className="text-[11px] opacity-90 mt-0.5">Discover verified offers from top stores</p>
            </div>

            {/* Store Pill Preview */}
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: primary }}>
                🏪 All Deals
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-black bg-white border" style={{ borderColor: secondary }}>
                📦 Amazon
              </span>
            </div>

            {/* Deal Card Preview */}
            <div className="bg-white rounded-xl p-3 border shadow-xs flex flex-col gap-2" style={{ borderColor: '#d7d5dc' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black truncate">Wireless Headphones</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: secondary }}>
                  Myntra
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <span className="text-sm font-extrabold" style={{ color: primary }}>₹1,499</span>
                  <span className="text-xs text-gray-400 line-through ml-1.5">₹3,999</span>
                </div>
                <button className="text-xs font-bold px-3 py-1 rounded-lg text-white" style={{ backgroundColor: primary }}>
                  More ℹ️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
