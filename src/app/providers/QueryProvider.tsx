import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { getErrorStatus } from '../../services/api/apiError'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once for network problems and server errors (5xx) only.
      // A 4xx (not found, forbidden, invalid input) will give the same answer again.
      retry: (failureCount, error) => {
        const status = getErrorStatus(error)
        return failureCount < 1 && (status === undefined || status >= 500)
      },
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}