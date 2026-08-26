import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#f2f3fb' }}
    >
      <div
        className="max-w-md w-full rounded-xl border p-8 text-center"
        style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
      >
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-xl font-bold" style={{ color: '#000000' }}>
          404 — Page Not Found
        </h1>
        <p className="text-sm mt-2" style={{ color: '#bab0c1' }}>
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block py-2 px-5 rounded-lg text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#6040d1', textDecoration: 'none' }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
