'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'newest', label: '🔥 Newest First' },
  { value: 'price_asc', label: '💰 Price: Low to High' },
  { value: 'price_desc', label: '🏷️ Price: High to Low' },
  { value: 'discount', label: '⚡ Highest Discount %' },
  { value: 'popular', label: '👑 Most Popular' },
] as const

export default function SortSelect({ currentSort = 'newest' }: { currentSort?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSortChange(newSort: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (newSort === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', newSort)
    }
    const qs = params.toString()
    router.push(pathname + (qs ? `?${qs}` : ''), { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="deal-sort-select" className="text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0">
        Sort:
      </label>
      <div className="relative shrink-0">
        <select
          id="deal-sort-select"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="appearance-none rounded-xl border px-3 py-1.5 pr-8 text-xs font-bold text-black outline-none transition-all cursor-pointer shadow-2xs hover:bg-slate-50"
          style={{
            borderColor: '#d7d5dc',
            backgroundColor: '#ffffff',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          ▼
        </span>
      </div>
    </div>
  )
}
