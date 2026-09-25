import { NavLink } from 'react-router-dom'
import { useCategories } from '../../features/catalog/hooks/useCatalog'

export function Navigation() {
  const { data: categories } = useCategories()
  const topCategories = (categories ?? []).filter((c) => !c.parentCategoryId)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap hover:text-white ${isActive ? 'font-semibold text-white' : ''}`

  return (
    <nav aria-label="Categories" className="bg-primary-dark text-sm text-primary-light">
      <div className="mx-auto flex min-h-9 max-w-7xl gap-6 overflow-x-auto px-4 py-2">
        <NavLink to="/search" end className={linkClass}>
          All products
        </NavLink>
        {topCategories.map((category) => (
          <NavLink key={category.id} to={`/category/${category.id}`} className={linkClass}>
            {category.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}