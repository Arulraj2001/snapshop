import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'
import { configCache } from '@/lib/config'

const ALLOWED_KEYS = [
  'free_post_limit',
  'platform_fee_amount',
  'referral_commission',
  'welcome_bonus_amount',
  'min_withdrawal_amount',
  'max_posts_per_day',
  'new_posts_require_approval',
  'hero_badge_text',
  'hero_headline',
  'hero_subtitle',
  'hero_stat_1_val',
  'hero_stat_1_lbl',
  'hero_stat_2_val',
  'hero_stat_2_lbl',
  'hero_stat_3_val',
  'hero_stat_3_lbl',
  'site_name',
  'site_tagline',
  'site_logo_emoji',
  'contact_email',
  'copyright_text',
  'site_primary_color',
  'site_secondary_color',
  'site_bg_color',
  'site_hero_gradient_from',
  'site_hero_gradient_to',
  'site_hero_gradient_start',
  'site_hero_gradient_end',
] as const

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAdmin()
    const body = await request.json()
    const { key, value } = body as { key: string; value: string | number | boolean }

    // Validate key is in the allowed list
    if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
      return Response.json({ error: `Key "${key}" is not allowed` }, { status: 400 })
    }

    if (value === undefined || value === null || String(value).trim() === '') {
      return Response.json({ error: 'Value is required' }, { status: 400 })
    }

    const stringValue = String(value)

    const { error } = await serviceClient
      .from('platform_config')
      .upsert({
        key,
        value: stringValue,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'key' })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Invalidate the in-memory cache for this key so the next
    // call to getConfig() fetches fresh data from the DB
    delete configCache[key]

    return Response.json({ success: true })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
