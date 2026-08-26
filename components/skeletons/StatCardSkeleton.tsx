export default function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-4 flex-1 animate-pulse"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      <div className="h-3 w-24 rounded" style={{ backgroundColor: '#d7d5dc' }} />
      <div className="h-7 w-20 rounded mt-2" style={{ backgroundColor: '#d7d5dc' }} />
      <div className="h-3 w-32 rounded mt-2" style={{ backgroundColor: '#d7d5dc' }} />
    </div>
  )
}
