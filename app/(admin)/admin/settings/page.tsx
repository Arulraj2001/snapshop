import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ConfigRow from '@/components/admin/ConfigRow'

export const metadata: Metadata = {
  title: 'snapShop Admin — Settings',
  description: 'Platform configuration and hero banner settings.',
}

const POSTING_RULES: { label: string; key: string; type: 'number' | 'boolean' | 'text' | 'color' }[] = [
  { label: 'Free Posts Per User', key: 'free_post_limit', type: 'number' },
  { label: 'Platform Fee ₹', key: 'platform_fee_amount', type: 'number' },
  { label: 'Max Posts Per Day', key: 'max_posts_per_day', type: 'number' },
  { label: 'Require Admin Approval', key: 'new_posts_require_approval', type: 'boolean' },
]

const REFERRAL_CONFIG: { label: string; key: string; type: 'number' | 'boolean' | 'text' | 'color' }[] = [
  { label: 'Referral Commission ₹', key: 'referral_commission', type: 'number' },
  { label: 'Minimum Withdrawal ₹', key: 'min_withdrawal_amount', type: 'number' },
]

const HERO_CONFIG: { label: string; key: string; type: 'number' | 'boolean' | 'text' | 'color' }[] = [
  { label: 'Hero Top Badge Text', key: 'hero_badge_text', type: 'text' },
  { label: 'Hero Headline', key: 'hero_headline', type: 'text' },
  { label: 'Hero Subtitle Description', key: 'hero_subtitle', type: 'text' },
  { label: 'Stat 1 Value', key: 'hero_stat_1_val', type: 'text' },
  { label: 'Stat 1 Label', key: 'hero_stat_1_lbl', type: 'text' },
  { label: 'Stat 2 Value', key: 'hero_stat_2_val', type: 'text' },
  { label: 'Stat 2 Label', key: 'hero_stat_2_lbl', type: 'text' },
  { label: 'Stat 3 Value', key: 'hero_stat_3_val', type: 'text' },
  { label: 'Stat 3 Label', key: 'hero_stat_3_lbl', type: 'text' },
]

const BRANDING_CONFIG: { label: string; key: string; type: 'number' | 'boolean' | 'text' | 'color' }[] = [
  { label: 'Hero Gradient Start Color', key: 'site_hero_gradient_start', type: 'color' },
  { label: 'Hero Gradient End Color', key: 'site_hero_gradient_end', type: 'color' },
]

const KEY_LABELS: Record<string, string> = {
  free_post_limit: 'Free Posts Per User',
  platform_fee_amount: 'Platform Fee',
  max_posts_per_day: 'Max Posts Per Day',
  new_posts_require_approval: 'Require Admin Approval',
  referral_commission: 'Referral Commission',
  min_withdrawal_amount: 'Minimum Withdrawal',
  hero_badge_text: 'Hero Badge Text',
  hero_headline: 'Hero Headline',
  hero_subtitle: 'Hero Subtitle',
  hero_stat_1_val: 'Stat 1 Value',
  hero_stat_1_lbl: 'Stat 1 Label',
  hero_stat_2_val: 'Stat 2 Value',
  hero_stat_2_lbl: 'Stat 2 Label',
  hero_stat_3_val: 'Stat 3 Value',
  hero_stat_3_lbl: 'Stat 3 Label',
  site_hero_gradient_start: 'Hero Gradient Start',
  site_hero_gradient_end: 'Hero Gradient End',
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'at launch'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-6 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
      <div className="border-b pb-3 mb-4" style={{ borderColor: '#f2f3fb' }}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-black">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  )
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data: configs } = await supabase
    .from('platform_config')
    .select('key, value, updated_at, updated_by')
    .order('updated_at', { ascending: false })

  const configMap = Object.fromEntries((configs ?? []).map((c) => [c.key, c.value ?? '']))

  const updaterIds = [
    ...new Set(
      (configs ?? [])
        .map((c) => c.updated_by)
        .filter((id): id is string => !!id)
    ),
  ]

  let adminNames: Record<string, string> = {}
  if (updaterIds.length > 0) {
    const { data: admins } = await supabase
      .from('users')
      .select('id, name')
      .in('id', updaterIds)
    adminNames = Object.fromEntries((admins ?? []).map((a) => [a.id, a.name ?? 'Admin']))
  }

  const auditLog = (configs ?? []).filter((c) => c.updated_at)

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-black">Platform Settings ⚙️</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage site branding, hero banner content, stats, posting limits, and referral rules.
        </p>
      </div>

      {/* 1. Hero Banner Content */}
      <Section title="Hero Banner & Copy Settings" description="Customize homepage banner badge, headline, subhead description, and the 3 stat indicators.">
        {HERO_CONFIG.map((row) => (
          <ConfigRow
            key={row.key}
            label={row.label}
            configKey={row.key}
            type={row.type}
            initialValue={configMap[row.key] ?? ''}
          />
        ))}
      </Section>

      {/* 2. Hero Banner Colors */}
      <Section title="Hero Gradient Theme Colors" description="Select the background gradient colors for the homepage hero card.">
        {BRANDING_CONFIG.map((row) => (
          <ConfigRow
            key={row.key}
            label={row.label}
            configKey={row.key}
            type={row.type}
            initialValue={configMap[row.key] ?? ''}
          />
        ))}
      </Section>

      {/* 3. Posting Rules */}
      <Section title="Posting Rules & Limits">
        {POSTING_RULES.map((row) => (
          <ConfigRow
            key={row.key}
            label={row.label}
            configKey={row.key}
            type={row.type}
            initialValue={configMap[row.key] ?? ''}
          />
        ))}
      </Section>

      {/* 4. Referral & Withdrawals */}
      <Section title="Referral & Withdrawal Controls">
        {REFERRAL_CONFIG.map((row) => (
          <ConfigRow
            key={row.key}
            label={row.label}
            configKey={row.key}
            type={row.type}
            initialValue={configMap[row.key] ?? ''}
          />
        ))}
      </Section>

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <Section title="Recent Config Change Log" description="Audit log of setting updates by administrators.">
          <div className="flex flex-col gap-2">
            {auditLog.slice(0, 10).map((entry) => {
              const adminName = entry.updated_by ? (adminNames[entry.updated_by] ?? 'Admin') : null
              const keyLabel = KEY_LABELS[entry.key] ?? entry.key
              const displayValue =
                entry.value === 'true' ? 'Enabled' : entry.value === 'false' ? 'Disabled' : entry.value

              return (
                <div key={entry.key} className="py-2 flex items-center justify-between text-xs border-b border-[#f2f3fb] last:border-b-0">
                  <p className="text-gray-600">
                    {adminName ? (
                      <>
                        <span className="font-bold text-black">{adminName}</span> updated{' '}
                        <span className="font-semibold text-black">{keyLabel}</span> to{' '}
                        <span className="font-mono font-bold text-[#6040d1]">{displayValue}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-black">{keyLabel}</span> —{' '}
                        <span className="font-mono font-bold text-[#6040d1]">{displayValue}</span>
                      </>
                    )}
                  </p>
                  <span className="text-gray-400 shrink-0 ml-4">{relativeTime(entry.updated_at)}</span>
                </div>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
