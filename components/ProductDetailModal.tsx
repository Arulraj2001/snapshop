'use client'

import { useState, useEffect } from 'react'

interface ProductDetailModalProps {
  id: string
  title: string
  images: string[]
  offer_price: number
  mrp: number | null
  store: string
  category?: string
  description?: string | null
  affiliate_link: string
  onClose: () => void
}

const STORE_CONFIG: Record<
  string,
  {
    bg: string
    text: string
    icon: string
    cardGradient: string
  }
> = {
  Amazon: {
    bg: '#ff9900',
    text: '#111111',
    icon: '📦',
    cardGradient: 'linear-gradient(135deg, #fffcf7 0%, #ffeec2 100%)',
  },
  Flipkart: {
    bg: '#2874f0',
    text: '#ffffff',
    icon: '⚡',
    cardGradient: 'linear-gradient(135deg, #f4f8ff 0%, #dbe7ff 100%)',
  },
  Myntra: {
    bg: '#ff3f6c',
    text: '#ffffff',
    icon: '💄',
    cardGradient: 'linear-gradient(135deg, #fff5f7 0%, #ffe0e6 100%)',
  },
  Meesho: {
    bg: '#9f2089',
    text: '#ffffff',
    icon: '🛍️',
    cardGradient: 'linear-gradient(135deg, #fdf4fc 0%, #f7dbf2 100%)',
  },
}

export default function ProductDetailModal({
  id,
  title,
  images,
  offer_price,
  mrp,
  store,
  category,
  description,
  affiliate_link,
  onClose,
}: ProductDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const discount =
    mrp && mrp > offer_price
      ? Math.round((1 - offer_price / mrp) * 100)
      : null

  const savings = mrp && mrp > offer_price ? mrp - offer_price : null

  const storeTheme = STORE_CONFIG[store] ?? {
    bg: '#6040d1',
    text: '#ffffff',
    icon: '🛍️',
    cardGradient: 'linear-gradient(135deg, #f2f3fb 0%, #e2e4f7 100%)',
  }

  function handleBuy() {
    fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id }),
    }).catch(() => {})

    window.open(affiliate_link, '_blank', 'noopener,noreferrer')
  }

  const activeImageSrc = images?.[activeImageIdx] ?? null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        style={{ borderColor: '#d7d5dc' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-md"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Scroll Container */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6">
          {/* Top Image Viewer Section */}
          <div className="flex flex-col gap-3">
            <div
              className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border bg-slate-50 flex items-center justify-center"
              style={{ borderColor: '#d7d5dc' }}
            >
              {activeImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImageSrc}
                  alt={title}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none"
                  style={{ background: storeTheme.cardGradient }}
                >
                  <span className="text-5xl mb-2">{storeTheme.icon}</span>
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{ backgroundColor: storeTheme.bg, color: storeTheme.text }}
                  >
                    {store} Deal
                  </span>
                </div>
              )}

              {/* Discount Badge */}
              {discount !== null && (
                <span
                  className="absolute top-3 left-3 text-xs font-extrabold text-white rounded-lg shadow-md flex items-center gap-1 px-3 py-1"
                  style={{ background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)' }}
                >
                  🔥 {discount}% OFF
                </span>
              )}

              {/* Store Badge */}
              <span
                className="absolute top-3 right-12 text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 px-3 py-1"
                style={{ backgroundColor: storeTheme.bg, color: storeTheme.text }}
              >
                <span>{storeTheme.icon}</span>
                <span>{store}</span>
              </span>
            </div>

            {/* Image Thumbnails Selector */}
            {images && images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIdx === i ? 'scale-105 shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: activeImageIdx === i ? storeTheme.bg : '#d7d5dc',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Header & Meta */}
          <div className="flex flex-col gap-2 border-b pb-4" style={{ borderColor: '#f2f3fb' }}>
            {category && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#6040d1]">
                {category}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-extrabold text-black leading-snug">
              {title}
            </h2>

            {/* Pricing Details */}
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#6040d1] tabular-nums">
                ₹{offer_price.toLocaleString('en-IN')}
              </span>
              {mrp && mrp > offer_price && (
                <span className="text-base line-through text-gray-400 tabular-nums">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
              {savings && (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  You Save ₹{savings.toLocaleString('en-IN')}!
                </span>
              )}
            </div>
          </div>

          {/* Product Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              Deal Overview &amp; Offers 📝
            </h3>
            <div className="rounded-2xl border p-4 bg-slate-50 text-sm leading-relaxed text-gray-700" style={{ borderColor: '#d7d5dc' }}>
              {description ? (
                <p className="whitespace-pre-wrap">{description}</p>
              ) : (
                <p className="text-gray-400 italic">
                  No additional product description provided for this offer. Click buy now to inspect details on {store}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 bg-white border-t border-[#f2f3fb] flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Verified Price</span>
            <span className="text-lg font-extrabold text-black">
              ₹{offer_price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleBuy}
            className="flex-1 max-w-xs py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-102"
            style={{
              backgroundColor: storeTheme.bg,
              color: storeTheme.text,
            }}
          >
            <span>Buy on {store}</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  )
}
