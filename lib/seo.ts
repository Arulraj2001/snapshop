import type { Metadata } from 'next'

export interface ProductSeoData {
  id: string
  title: string
  images: string[]
  offer_price: number
  mrp?: number | null
  store: string
  category: string
  description?: string | null
  affiliate_link: string
  created_at: string
}

/**
 * Converts a product title into a clean, URL-safe SEO slug.
 * Example: "Apple iPhone 15 (128 GB) - Blue!" => "apple-iphone-15-128-gb-blue"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, '') // trim - from end of text
}

/**
 * Calculates discount percentage between MRP and Offer Price.
 */
export function getDiscountPercentage(offerPrice: number, mrp?: number | null): number {
  if (!mrp || mrp <= offerPrice) return 0
  return Math.round(((mrp - offerPrice) / mrp) * 100)
}

/**
 * Generates dynamic Next.js Metadata for a product deal page.
 */
export function generateProductMetadata(
  product: ProductSeoData,
  siteName = 'snapShop',
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapshop.vercel.app'
): Metadata {
  const discount = getDiscountPercentage(product.offer_price, product.mrp)
  const formattedPrice = `₹${Number(product.offer_price).toLocaleString('en-IN')}`
  const formattedMrp = product.mrp ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : null

  const slug = slugify(product.title)
  const pageUrl = `${baseUrl}/deals/${product.id}/${slug}`
  const primaryImage = product.images?.[0] || `${baseUrl}/stores/${product.store.toLowerCase()}.png`

  // Dynamic Title pattern: Title — Price (Discount% OFF on Store) | siteName
  const title = `${product.title} — ${formattedPrice}${
    discount > 0 ? ` (${discount}% OFF on ${product.store})` : ` on ${product.store}`
  } | ${siteName}`

  // Dynamic Meta Description pattern
  const description = product.description?.trim()
    ? product.description.slice(0, 160)
    : `Buy ${product.title} for just ${formattedPrice}${
        formattedMrp ? ` (MRP ${formattedMrp}, save ${discount}%)` : ''
      } on ${product.store} under ${product.category}. Verified price drop & affiliate deal rewards on ${siteName}.`

  const keywords = [
    product.title,
    `${product.title} price`,
    `${product.title} ${product.store}`,
    `${product.category} deals`,
    `buy ${product.title} online`,
    `${product.store} offers`,
    `${siteName} cashback`,
  ]

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `🔥 Deal Alert: ${product.title} at ${formattedPrice}`,
      description: `Save ${discount}% on ${product.store}! Verified affiliate deal on ${siteName}.`,
      url: pageUrl,
      siteName,
      type: 'article',
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} — ${formattedPrice} (${discount}% OFF)`,
      description,
      images: [primaryImage],
    },
  }
}

/**
 * Generates Schema.org JSON-LD structured data for Google Search rich snippets.
 */
export function generateProductSchema(
  product: ProductSeoData,
  siteName = 'snapShop',
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapshop.vercel.app'
) {
  const primaryImage = product.images?.[0] || `${baseUrl}/stores/${product.store.toLowerCase()}.png`
  const slug = slugify(product.title)
  const pageUrl = `${baseUrl}/deals/${product.id}/${slug}`

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images && product.images.length > 0 ? product.images : [primaryImage],
    description:
      product.description ||
      `Best deal on ${product.title} available on ${product.store} for ${product.offer_price} INR.`,
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.offer_price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: product.affiliate_link || pageUrl,
      seller: {
        '@type': 'Organization',
        name: product.store,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
    },
  }
}
