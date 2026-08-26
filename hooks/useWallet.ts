'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Subscribes to realtime updates on public.users for this userId
 * and returns the live wallet_balance. Falls back to initialBalance
 * before the first realtime event arrives.
 */
export function useWallet(userId: string, initialBalance: number) {
  const [balance, setBalance] = useState(initialBalance)

  useEffect(() => {
    if (!userId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`wallet-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = payload.new?.wallet_balance
          if (typeof newBalance === 'number') {
            setBalance(newBalance)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return balance
}
