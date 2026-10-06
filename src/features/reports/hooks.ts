import { keepPreviousData, useQuery } from '@tanstack/react-query'
import apiClient from '../../services/api/apiClient'
import type { SalesChartData, SalesRange } from '../../types/report'

// "seller": the logged-in seller's own sales. "shop": every seller's (admins).
export function useSalesChart(scope: 'seller' | 'shop', days: SalesRange) {
  const url = scope === 'seller' ? '/seller/earnings/sales' : '/admin/dashboard/sales'
  return useQuery({
    queryKey: [scope === 'seller' ? 'seller' : 'admin', 'sales-chart', days],
    queryFn: async () => (await apiClient.get<SalesChartData>(url, { params: { days } })).data,
    // Switching range keeps the old chart (dimmed) until the new one arrives.
    placeholderData: keepPreviousData,
  })
}
