import Link from 'next/link'
import StoreLogo from './StoreLogo'

const STORES = [
  {
    name: 'All',
    logoUrl: null as string | null,
    fallbackEmoji: '🏪',
    activeBg: '#6040d1',
    activeColor: '#ffffff',
    inactiveBg: '#f2f3fb',
    inactiveBorder: '#6040d1',
    inactiveColor: '#6040d1',
  },
  {
    name: 'Amazon',
    logoUrl: '/stores/amazon.png',
    fallbackEmoji: '📦',
    activeBg: '#ff9900',
    activeColor: '#111111',
    inactiveBg: '#fff8ed',
    inactiveBorder: '#ff9900',
    inactiveColor: '#d97706',
  },
  {
    name: 'Flipkart',
    logoUrl: '/stores/flipkart.png',
    fallbackEmoji: '⚡',
    activeBg: '#2874f0',
    activeColor: '#ffffff',
    inactiveBg: '#edf4ff',
    inactiveBorder: '#2874f0',
    inactiveColor: '#1d4ed8',
  },
  {
    name: 'Meesho',
    logoUrl: '/stores/meesho.png',
    fallbackEmoji: '🛍️',
    activeBg: '#f43397',
    activeColor: '#ffffff',
    inactiveBg: '#fdf0f7',
    inactiveBorder: '#f43397',
    inactiveColor: '#be185d',
  },
  {
    name: 'Myntra',
    logoUrl: '/stores/myntra.png',
    fallbackEmoji: '💄',
    activeBg: '#ff3f6c',
    activeColor: '#ffffff',
    inactiveBg: '#fff0f3',
    inactiveBorder: '#ff3f6c',
    inactiveColor: '#e11d48',
  },
]

interface StoreTabsProps {
  activeStore?: string
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

export default function StoreTabs({
  activeStore,
  searchParams = {},
  layout = 'horizontal',
}: StoreTabsProps) {
  const base: Record<string, string> = {}
  if (searchParams.q) base.q = searchParams.q
  if (searchParams.category) base.category = searchParams.category

  const isVertical = layout === 'vertical'

  return (
    <div
      className={
        isVertical
          ? 'flex flex-col gap-1.5 w-full'
          : 'flex gap-2 overflow-x-auto pb-1 hide-scrollbar'
      }
      style={isVertical ? undefined : { scrollbarWidth: 'none' }}
    >
      {STORES.map((s) => {
        const isActive =
          s.name === 'All' ? !activeStore : activeStore === s.name
        const href =
          s.name === 'All'
            ? buildHref(base, 'store', null)
            : buildHref({ ...base, store: s.name }, 'store', s.name)

        return (
          <Link
            key={s.name}
            href={href}
            scroll={false}
            id={`store-tab-${s.name.toLowerCase()}`}
            className={
              isVertical
                ? 'w-full text-xs font-bold rounded-lg px-3.5 py-2 transition-all flex items-center justify-between cursor-pointer'
                : 'shrink-0 text-xs sm:text-sm rounded-full px-3.5 py-1.5 transition-all font-bold flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-105'
            }
            style={
              isActive
                ? {
                    backgroundColor: s.activeBg,
                    color: s.activeColor,
                    border: `1.5px solid ${s.activeBg}`,
                    textDecoration: 'none',
                    boxShadow: isVertical ? '0 2px 6px rgba(0,0,0,0.12)' : '0 3px 10px rgba(0,0,0,0.15)',
                  }
                : {
                    backgroundColor: s.inactiveBg,
                    color: s.inactiveColor,
                    border: `1.5px solid ${s.inactiveBorder}`,
                    textDecoration: 'none',
                  }
            }
          >
            <div className="flex items-center gap-2">
              {s.logoUrl ? (
                <StoreLogo
                  logoUrl={s.logoUrl}
                  name={s.name}
                  fallbackEmoji={s.fallbackEmoji}
                  size={18}
                />
              ) : (
                <span className="text-base">{s.fallbackEmoji}</span>
              )}
              <span>{s.name}</span>
            </div>
            {isVertical && isActive && <span className="text-xs">✓</span>}
          </Link>
        )
      })}
    </div>
  )
}
