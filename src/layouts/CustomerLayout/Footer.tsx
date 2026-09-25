import { Logo } from '../../components/ui/Logo'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-slate-400">Shop from trusted sellers across Nigeria. Pay online or on delivery.</p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-white">Help</h3>
          <ul className="space-y-1">
            <li>Track an order</li>
            <li>Returns &amp; refunds</li>
            <li>Contact us</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-white">Sell on Prodify</h3>
          <ul className="space-y-1">
                        <li>
              <Link to="/sell" className="hover:text-white">
                Become a seller
              </Link>
            </li>
            <li>
              <Link to="/seller" className="hover:text-white">
                Seller Centre
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Prodify
      </p>
    </footer>
  )
}