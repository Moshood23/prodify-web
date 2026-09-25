import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '../components/ui/Toaster'

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App