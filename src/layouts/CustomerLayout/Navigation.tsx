import { Link } from 'react-router-dom'

// Placeholder categories; these will come from GET /api/categories later.
const categories = ['Phones & Tablets', 'Computing', 'Electronics', 'Fashion', 'Home & Office', 'Supermarket', 'Deals']

export function Navigation() {
  return (
    <nav className="bg-primary-dark text-sm text-primary-light">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2">
        {categories.map((category) => (
          <Link key={category} to="/" className="whitespace-nowrap hover:text-white">
            {category}
          </Link>
        ))}
      </div>
    </nav>
  )
}