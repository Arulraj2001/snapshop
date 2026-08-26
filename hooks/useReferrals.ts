'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Referral {
  id: string
  referred_id: string
  status: 'pending' | 'paid'
  commission_amount: number
  paid_at: string | null
  created_at: string
}

interface UseReferralsResult {
  referrals: Referral[]
  paidCount: number
  pendingCount: number
  totalEarned: number
  loading: boolean
}

/**
 * Fetches referrals for the given referrerId and subscribes to
 * realtime INSERT/UPDATE events on public.referrals so the UI
 * updates immediately when a referred user converts.
 */
export function useReferrals(referrerId: string): UseReferralsResult {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!referrerId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Initial fetch
    supabase
      .from('referrals')
      .select('id, referred_id, status, commission_amount, paid_at, created_at')
      .eq('referrer_id', referrerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReferrals(data as Referral[])
        setLoading(false)
      })

    // Realtime subscription for new or updated referrals
    const channel = supabase
      .channel(`referrals-${referrerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${referrerId}`,
        },
        (payload) => {
          setReferrals((prev) => [payload.new as Referral, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${referrerId}`,
        },
        (payload) => {
          setReferrals((prev) =>
            prev.map((r) =>
              r.id === (payload.new as Referral).id
                ? (payload.new as Referral)
                : r
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [referrerId])

  const paidCount = referrals.filter((r) => r.status === 'paid').length
  const pendingCount = referrals.filter((r) => r.status === 'pending').length
  const totalEarned = referrals.reduce(
    (sum, r) => sum + Number(r.commission_amount),
    0
  )

  return { referrals, paidCount, pendingCount, totalEarned, loading }
}
