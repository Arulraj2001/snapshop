'use client'

import { useState } from 'react'
import ProductDetailModal from './ProductDetailModal'
import { slugify } from '@/lib/seo'

interface ProductCardProps {
  id: string
  title: string
  images: string[]
  offer_price: number
  mrp: number | null
  store: string
  category?: string
  description?: string | null
  affiliate_link: string
}

const STORE_CONFIG: Record<
  string,
  {
    bg: string
    text: string
    icon: string
    logoUrl: string
    cardGradient: string
    accentBorder: string
  }
> = {
  Amazon: {
    bg: '#ff9900',
    text: '#111111',
    icon: '📦',
    logoUrl: '/stores/amazon.png',
    cardGradient: 'linear-gradient(135deg, #fffcf7 0%, #ffeec2 100%)',
    accentBorder: '#ff9900',
  },
  Flipkart: {
    bg: '#2874f0',
    text: '#ffffff',
    icon: '⚡',
    logoUrl: '/stores/flipkart.png',
    cardGradient: 'linear-gradient(135deg, #f4f8ff 0%, #dbe7ff 100%)',
    accentBorder: '#2874f0',
  },
  Myntra: {
    bg: '#ff3f6c',
    text: '#ffffff',
    icon: '💄',
    logoUrl: '/stores/myntra.png',
    cardGradient: 'linear-gradient(135deg, #fff5f7 0%, #ffe0e6 100%)',
    accentBorder: '#ff3f6c',
  },
  Meesho: {
    bg: '#9f2089',
    text: '#ffffff',
    icon: '🛍️',
    logoUrl: '/stores/meesho.png',
    cardGradient: 'linear-gradient(135deg, #fdf4fc 0%, #f7dbf2 100%)',
    accentBorder: '#9f2089',
  },
}

export default function ProductCard({
  id,
  title,
  images,
  offer_price,
  mrp,
  store,
  category,
  description,
  affiliate_link,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const discount =
    mrp && mrp > offer_price
      ? Math.round((1 - offer_price / mrp) * 100)
      : null

  const rawSrc = images?.[0] ?? null
  const hasValidImage = rawSrc && !imageError

  const storeTheme = STORE_CONFIG[store] ?? {
    bg: '#6040d1',
    text: '#ffffff',
    icon: '🛍️',
    cardGradient: 'linear-gradient(135deg, #f2f3fb 0%, #e2e4f7 100%)',
    accentBorder: '#6040d1',
  }

  const slug = slugify(title)
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/deals/${id}/${slug}` : `/deals/${id}/${slug}`

  function handleBuy(e: React.MouseEvent) {
    e.stopPropagation()
    fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id }),
    }).catch(() => {})

    window.open(affiliate_link, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {showModal && (
        <ProductDetailModal
          id={id}
          title={title}
          images={images}
          offer_price={offer_price}
          mrp={mrp}
          store={store}
          category={category}
          description={description}
          affiliate_link={affiliate_link}
          canonicalUrl={canonicalUrl}
          onClose={() => setShowModal(false)}
        />
      )}

      <div
        className="group rounded-2xl border flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer bg-white"
        style={{
          borderColor: '#d7d5dc',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
        onClick={() => setShowModal(true)}
      >
        {/* Image container */}
        <div className="relative w-full overflow-hidden aspect-square">
          {hasValidImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rawSrc}
              alt={title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none"
              style={{
                background: storeTheme.cardGradient,
              }}
            >
              <span className="text-4xl mb-1.5">{storeTheme.icon}</span>
              <span
                className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: storeTheme.bg,
                  color: storeTheme.text,
                }}
              >
                {store} Deal
              </span>
            </div>
          )}

          {/* Discount badge */}
          {discount !== null && (
            <span
              className="absolute top-2 left-2 text-xs font-extrabold text-white rounded-md shadow-xs flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
                padding: '3px 7px',
              }}
            >
              <span>🔥</span>
              <span>{discount}% OFF</span>
            </span>
          )}

          {/* Store badge */}
          <span
            className="absolute top-2 right-2 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
            style={{
              backgroundColor: storeTheme.bg,
              color: storeTheme.text,
              padding: '3px 8px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storeTheme.logoUrl}
              alt={store}
              width={14}
              height={14}
              className="rounded-xs object-contain bg-white"
              style={{ width: 14, height: 14 }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span>{store}</span>
          </span>
        </div>

        {/* Body */}
        <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
          {/* Title */}
          <p
            className="text-sm font-semibold leading-snug line-clamp-2 min-h-[40px]"
            style={{ color: '#000000' }}
          >
            {title}
          </p>

          {/* Pricing Row (Left: Price, Right: More Button) */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#6040d1] tabular-nums">
                ₹{offer_price.toLocaleString('en-IN')}
              </span>
              {mrp && mrp > offer_price && (
                <span className="text-xs line-through text-gray-400 tabular-nums">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#6040d1] bg-[#6040d1]/10 hover:bg-[#6040d1]/20 transition-colors cursor-pointer shrink-0"
            >
              More ℹ️
            </button>
          </div>

          {/* Buy button */}
          <button
            id={`buy-${id}`}
            onClick={handleBuy}
            className="mt-1 w-full text-xs font-bold rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            style={{
              backgroundColor: storeTheme.bg,
              color: storeTheme.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <span>Buy on {store}</span>
            <span className="text-xs">↗</span>
          </button>
        </div>
      </div>
    </>
  )
}
