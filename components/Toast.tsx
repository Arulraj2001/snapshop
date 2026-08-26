'use client'

import { useToast } from '@/hooks/useToast'

export default function Toast() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed z-50 flex flex-col gap-2 max-w-sm w-full transition-all duration-300"
      style={{
        bottom: '1rem',
        right: '1rem',
        left: '1rem',
        margin: '0 auto',
      }}
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        return (
          <div
            key={toast.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl border shadow-md transition-opacity duration-300 animate-fadeIn"
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#d7d5dc',
              borderLeftWidth: '4px',
              borderLeftColor: isError ? '#dc2626' : '#6040d1',
              color: '#000000',
            }}
          >
            <div className="flex items-center gap-2.5 text-sm">
              <span>{isError ? '⚠️' : '✅'}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-xs cursor-pointer ml-3 font-bold opacity-60 hover:opacity-100"
              style={{ color: '#bab0c1' }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
