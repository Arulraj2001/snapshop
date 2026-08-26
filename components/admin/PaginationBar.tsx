import Link from 'next/link'

interface PaginationBarProps {
  currentPage: number
  hasMore: boolean
  baseUrl: string
  searchParams?: Record<string, string>
}

export default function PaginationBar({
  currentPage,
  hasMore,
  baseUrl,
  searchParams = {},
}: PaginationBarProps) {
  if (currentPage === 1 && !hasMore) return null

  function createUrl(page: number) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (k !== 'page' && v) params.set(k, v)
    }
    params.set('page', String(page))
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <span className="text-xs" style={{ color: '#bab0c1' }}>
        Page {currentPage}
      </span>
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link
            href={createUrl(currentPage - 1)}
            className="px-3 py-1 rounded-lg border text-xs font-medium"
            style={{
              borderColor: '#d7d5dc',
              color: '#000000',
              backgroundColor: '#ffffff',
              textDecoration: 'none',
            }}
          >
            ← Previous
          </Link>
        ) : (
          <span
            className="px-3 py-1 rounded-lg border text-xs font-medium opacity-40 cursor-not-allowed"
            style={{
              borderColor: '#d7d5dc',
              color: '#bab0c1',
              backgroundColor: '#ffffff',
            }}
          >
            ← Previous
          </span>
        )}

        {hasMore ? (
          <Link
            href={createUrl(currentPage + 1)}
            className="px-3 py-1 rounded-lg border text-xs font-medium"
            style={{
              borderColor: '#d7d5dc',
              color: '#000000',
              backgroundColor: '#ffffff',
              textDecoration: 'none',
            }}
          >
            Next →
          </Link>
        ) : (
          <span
            className="px-3 py-1 rounded-lg border text-xs font-medium opacity-40 cursor-not-allowed"
            style={{
              borderColor: '#d7d5dc',
              color: '#bab0c1',
              backgroundColor: '#ffffff',
            }}
          >
            Next →
          </span>
        )}
      </div>
    </div>
  )
}
