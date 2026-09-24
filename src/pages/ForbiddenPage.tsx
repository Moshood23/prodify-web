import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-extrabold text-accent">403</p>
      <h1 className="mt-2 text-xl font-bold">You don't have access to this page</h1>
      <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
        Back to home
      </Link>
    </div>
  )
}