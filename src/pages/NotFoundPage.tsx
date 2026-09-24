import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-extrabold text-primary">404</p>
      <h1 className="mt-2 text-xl font-bold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
        Back to home
      </Link>
    </div>
  )
}