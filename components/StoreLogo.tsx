'use client'

interface StoreLogoProps {
  logoUrl: string
  name: string
  fallbackEmoji: string
  size?: number
}

export default function StoreLogo({
  logoUrl,
  name,
  fallbackEmoji,
  size = 18,
}: StoreLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${name} logo`}
      width={size}
      height={size}
      className="rounded-sm object-contain shrink-0"
      style={{ width: size, height: size }}
      onError={(e) => {
        const span = document.createElement('span')
        span.textContent = fallbackEmoji
        span.className = 'text-base'
        e.currentTarget.replaceWith(span)
      }}
    />
  )
}
