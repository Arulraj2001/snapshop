/**
 * Generates a shareable referral link for a user's referral code.
 * The ?ref= cookie is set by proxy.ts on the first visit.
 */
export function getReferralLink(referralCode: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://snapshop.com'
  return `${base}/?ref=${encodeURIComponent(referralCode)}`
}
