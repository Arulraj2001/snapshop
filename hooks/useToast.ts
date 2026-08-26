'use client'

import { useState, useEffect } from 'react'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error'
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent<Omit<ToastItem, 'id'>>('snapshop-toast', {
      detail: { message, type },
    })
    window.dispatchEvent(event)
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    function handleToast(e: Event) {
      const customEvent = e as CustomEvent<Omit<ToastItem, 'id'>>
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = {
        id,
        message: customEvent.detail.message,
        type: customEvent.detail.type,
      }

      setToasts((prev) => [...prev, newToast])

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    }

    window.addEventListener('snapshop-toast', handleToast)
    return () => window.removeEventListener('snapshop-toast', handleToast)
  }, [])

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, showToast, dismissToast }
}
