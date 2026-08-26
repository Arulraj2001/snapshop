'use client'

import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode | string
  title: string
  subtitle?: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({
  icon = '🛍️',
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {typeof icon === 'string' ? (
        <div className="text-4xl mb-3">{icon}</div>
      ) : (
        <div className="mb-3 text-[#6040d1]">{icon}</div>
      )}
      <h3 className="text-base font-medium" style={{ color: '#000000' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm mt-1 max-w-sm" style={{ color: '#bab0c1' }}>
          {subtitle}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white transition cursor-pointer"
          style={{ backgroundColor: '#6040d1', textDecoration: 'none' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#655baa'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6040d1'
          }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
