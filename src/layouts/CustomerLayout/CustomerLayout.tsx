import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Navigation } from './Navigation'
import { Footer } from './Footer'
import { PageLoading } from '../../components/ui/PageLoading'

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Navigation />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
