import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi } from './messagesApi'
import { useAuthStore } from '../../store/authStore'
import type { MessagesViewer, NewConversation } from '../../types/messages'

// New messages arrive without a page reload: lists and open conversations are checked every so often.
const LIST_REFRESH = 30 * 1000
const THREAD_REFRESH = 10 * 1000

export function useConversations(viewer: MessagesViewer, search?: string) {
  return useQuery({
    queryKey: ['messages', viewer, 'list', search ?? ''],
    queryFn: () => messagesApi.list(viewer, search),
    placeholderData: keepPreviousData,
    refetchInterval: viewer === 'admin' ? false : LIST_REFRESH,
  })
}

export function useConversation(viewer: MessagesViewer, id: string | undefined) {
  return useQuery({
    queryKey: ['messages', viewer, 'thread', id],
    queryFn: () => messagesApi.get(viewer, id!),
    enabled: !!id,
    refetchInterval: viewer === 'admin' ? false : THREAD_REFRESH,
  })
}

// For the badge next to "Messages". Only asks the API when signed in with that role.
export function useUnreadMessages(viewer: 'customer' | 'seller') {
  const role = viewer === 'customer' ? 'Customer' : 'Seller'
  const allowed = useAuthStore((s) => s.user?.roles.includes(role) ?? false)
  const { data } = useQuery({
    queryKey: ['messages', viewer, 'unread'],
    queryFn: () => messagesApi.unreadCount(viewer),
    enabled: allowed,
    refetchInterval: LIST_REFRESH,
  })
  return data ?? 0
}

function useRefreshMessages(viewer: MessagesViewer) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['messages', viewer] })
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }
}

export function useStartConversation() {
  const refresh = useRefreshMessages('customer')
  return useMutation({ mutationFn: (conversation: NewConversation) => messagesApi.start(conversation), onSuccess: refresh })
}

export function useReply(viewer: 'customer' | 'seller', id: string) {
  const refresh = useRefreshMessages(viewer)
  return useMutation({ mutationFn: (message: string) => messagesApi.reply(viewer, id, message), onSuccess: refresh })
}

export function useMarkRead(viewer: 'customer' | 'seller') {
  const refresh = useRefreshMessages(viewer)
  return useMutation({ mutationFn: (id: string) => messagesApi.markRead(viewer, id), onSuccess: refresh })
}
