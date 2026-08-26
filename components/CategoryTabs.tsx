import Link from 'next/link'

const CATEGORIES = [
  { name: 'All', icon: '✨' },
  { name: 'Mobiles', icon: '📱' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Home', icon: '🏠' },
] as const

interface CategoryTabsProps {
  activeCategory?: string
  searchParams?: Record<string, string>
  layout?: 'horizontal' | 'vertical'
}

function buildHref(
  base: Record<string, string>,
  key: string,
  value: string | null
) {
  const p = new URLSearchParams(base)
  if (value === null) p.delete(key)
  else p.set(key, value)
  const qs = p.toString()
  return qs ? `/?${qs}` : '/'
}

export default function CategoryTabs({
  activeCategory,
  searchParams = {},
  layout = 'horizontal',
}: CategoryTabsProps) {
  const base: Record<string, string> = {}
  if (searchParams.q) base.q = searchParams.q
  if (searchParams.store) base.store = searchParams.store

  const isVertical = layout === 'vertical'

  return (
    <div
      className={
        isVertical
          ? 'flex flex-col gap-1 w-full'
          : 'flex gap-2 overflow-x-auto pb-1 hide-scrollbar'
      }
      style={isVertical ? undefined : { scrollbarWidth: 'none' }}
    >
      {CATEGORIES.map((cat) => {
        const isActive =
          cat.name === 'All' ? !activeCategory : activeCategory === cat.name
        const href =
          cat.name === 'All'
            ? buildHref(base, 'category', null)
            : buildHref({ ...base, category: cat.name }, 'category', cat.name)

        return (
          <Link
            key={cat.name}
            href={href}
            scroll={false}
            id={`cat-tab-${cat.name.toLowerCase()}`}
            className={
              isVertical
                ? 'w-full text-xs font-semibold rounded-lg px-3.5 py-2 transition-all flex items-center justify-between cursor-pointer'
                : 'shrink-0 text-xs rounded-full px-3 py-1.5 transition font-medium flex items-center gap-1 cursor-pointer'
            }
            style={
              isActive
                ? {
                    backgroundColor: 'var(--site-primary-color, #6040d1)',
                    color: '#ffffff',
                    border: '1px solid var(--site-primary-color, #6040d1)',
                    textDecoration: 'none',
                    boxShadow: isVertical ? '0 2px 6px rgba(0,0,0,0.15)' : undefined,
                  }
                : {
                    backgroundColor: isVertical ? '#fafafa' : '#ffffff',
                    color: '#000000',
                    border: '1px solid #d7d5dc',
                    textDecoration: 'none',
                  }
            }
          >
            <div className="flex items-center gap-2">
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
            {isVertical && isActive && <span className="text-xs">✓</span>}
          </Link>
        )
      })}
    </div>
  )
}
