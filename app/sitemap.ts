import type { MetadataRoute } from 'next'
import { serviceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://snapshop.vercel.app'

  // Fetch approved products for dynamic sitemap indexing
  const { data: products } = await serviceClient
    .from('products')
    .select('id, title, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1000)

  // Static site pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic product deal URLs
  const dealPages: MetadataRoute.Sitemap = (products || []).map((p) => {
    const slug = slugify(p.title)
    return {
      url: `${baseUrl}/deals/${p.id}/${slug}`,
      lastModified: new Date(p.created_at || Date.now()),
      changeFrequency: 'daily',
      priority: 0.8,
    }
  })

  return [...staticPages, ...dealPages]
}
