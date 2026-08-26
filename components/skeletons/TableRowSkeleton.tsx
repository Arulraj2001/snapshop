export default function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse" style={{ borderBottom: '1px solid #f2f3fb' }}>
          <td className="px-4 py-3">
            <div className="h-4 w-32 rounded" style={{ backgroundColor: '#d7d5dc' }} />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 rounded" style={{ backgroundColor: '#d7d5dc' }} />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-16 rounded" style={{ backgroundColor: '#d7d5dc' }} />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 rounded" style={{ backgroundColor: '#d7d5dc' }} />
          </td>
          <td className="px-4 py-3 text-right">
            <div className="h-4 w-12 rounded ml-auto" style={{ backgroundColor: '#d7d5dc' }} />
          </td>
        </tr>
      ))}
    </>
  )
}
