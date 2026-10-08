import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../services/api/apiClient'
import type { PaginatedList } from '../../types/catalog'
import type { AppNotification } from '../../types/notification'

// The number on the bell. Checked every minute and whenever the tab gets focus again.
export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await apiClient.get<{ count: number }>('/notifications/unread-count')).data.count,
    enabled,
    refetchInterval: 60_000,
  })
}

// The latest ten, loaded when the bell is opened.
export function useLatestNotifications(enabled: boolean) {
  return useQuery({
    queryKey: ['notifications', 'latest'],
    queryFn: async () =>
      (await apiClient.get<PaginatedList<AppNotification>>('/notifications', { params: { pageSize: 10 } })).data.items,
    enabled,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
