import { serviceClient } from '@/lib/supabase/service'

// In-memory cache to avoid repeated DB hits for config values.
// Exported so the admin settings API can delete a key after update.
export const configCache: Record<string, { value: string; ts: number }> = {}
const CACHE_TTL = 60_000 // 1 minute

/**
 * Fetch a platform_config value by key using serviceClient (bypasses RLS).
 * Results are cached in memory for CACHE_TTL ms.
 */
export async function getConfig(key: string): Promise<string> {
  const now = Date.now()
  const cached = configCache[key]
  if (cached && now - cached.ts < CACHE_TTL) {
    return cached.value
  }

  try {
    const { data } = await serviceClient
      .from('platform_config')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    const value = data?.value ?? ''
    configCache[key] = { value, ts: now }
    return value
  } catch {
    return ''
  }
}

/**
 * Fetch a platform_config value with a fallback string default.
 */
export async function getConfigString(key: string, fallback: string): Promise<string> {
  const val = await getConfig(key)
  return val.trim() ? val : fallback
}

/**
 * Fetch a platform_config value and parse it as a number.
 */
export async function getConfigNumber(key: string, fallback = 0): Promise<number> {
  const val = await getConfig(key)
  const num = Number(val)
  return isNaN(num) || !val.trim() ? fallback : num
}

/**
 * Fetch a platform_config value and parse it as a boolean.
 * Returns true only if the stored value is exactly the string "true".
 */
export async function getConfigBool(key: string, fallback = false): Promise<boolean> {
  const val = await getConfig(key)
  if (!val.trim()) return fallback
  return val === 'true'
}

export interface SiteConfig {
  siteName: string
  siteTagline: string
  siteLogoEmoji: string
  contactEmail: string
  copyrightText: string
  primaryColor: string
  secondaryColor: string
  bgColor: string
  heroGradientFrom: string
  heroGradientTo: string
}

/**
 * Convenience helper to fetch all global site branding & theme colors.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  const [
    siteName,
    siteTagline,
    siteLogoEmoji,
    contactEmail,
    copyrightText,
    primaryColor,
    secondaryColor,
    bgColor,
    heroGradientFrom,
    heroGradientTo,
  ] = await Promise.all([
    getConfigString('site_name', 'snapShop'),
    getConfigString('site_tagline', 'Best Affiliate Deals & Cashback Community'),
    getConfigString('site_logo_emoji', '🛍️'),
    getConfigString('contact_email', 'support@snapshop.com'),
    getConfigString('copyright_text', '© 2026 snapShop. All rights reserved.'),
    getConfigString('site_primary_color', '#6040d1'),
    getConfigString('site_secondary_color', '#9f2089'),
    getConfigString('site_bg_color', '#f2f3fb'),
    getConfigString('site_hero_gradient_from', '#6040d1'),
    getConfigString('site_hero_gradient_to', '#9f2089'),
  ])

  return {
    siteName,
    siteTagline,
    siteLogoEmoji,
    contactEmail,
    copyrightText,
    primaryColor,
    secondaryColor,
    bgColor,
    heroGradientFrom,
    heroGradientTo,
  }
}
