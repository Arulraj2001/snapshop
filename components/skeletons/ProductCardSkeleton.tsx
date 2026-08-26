export default function ProductCardSkeleton() {
  return (
    <div
      className="rounded-xl border flex flex-col overflow-hidden animate-pulse"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#d7d5dc',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image area */}
      <div
        className="w-full rounded-t-xl"
        style={{ aspectRatio: '1/1', backgroundColor: '#d7d5dc' }}
      />

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Title 2 lines */}
        <div className="h-3 rounded w-3/4" style={{ backgroundColor: '#d7d5dc' }} />
        <div className="h-3 rounded w-1/2" style={{ backgroundColor: '#d7d5dc' }} />

        {/* Price */}
        <div className="h-4 rounded w-16 mt-1" style={{ backgroundColor: '#d7d5dc' }} />

        {/* Button */}
        <div className="h-7 rounded-lg w-full mt-2" style={{ backgroundColor: '#d7d5dc' }} />
      </div>
    </div>
  )
}
