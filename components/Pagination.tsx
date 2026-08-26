'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    const qs = params.toString()
    router.push(pathname + (qs ? `?${qs}` : ''), { scroll: true })
  }

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers array (e.g., 1 2 3 4)
  const pages: (number | string)[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (
      (i === currentPage - 2 && currentPage > 3) ||
      (i === currentPage + 2 && currentPage < totalPages - 2)
    ) {
      pages.push('...')
    }
  }

  // Deduplicate consecutive '...'
  const filteredPages = pages.filter((item, index, array) => {
    return item !== '...' || array[index - 1] !== '...'
  })

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
      {/* Count summary */}
      <p className="text-xs font-semibold text-gray-500">
        Showing <span className="text-black font-extrabold">{startItem}–{endItem}</span> of{' '}
        <span className="text-black font-extrabold">{totalItems}</span> deals
      </p>

      {/* Navigation controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          style={{ borderColor: '#d7d5dc', color: '#000000' }}
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {filteredPages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">
                  ...
                </span>
              )
            }
            const isCurrent = p === currentPage
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => goToPage(Number(p))}
                className="w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border"
                style={
                  isCurrent
                    ? {
                        backgroundColor: 'var(--site-primary-color, #6040d1)',
                        color: '#ffffff',
                        borderColor: 'var(--site-primary-color, #6040d1)',
                      }
                    : {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        borderColor: '#d7d5dc',
                      }
                }
              >
                {p}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          style={{ borderColor: '#d7d5dc', color: '#000000' }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
