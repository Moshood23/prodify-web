import apiClient from '../../services/api/apiClient'
import type { Conversation, ConversationSummary, MessagesViewer, NewConversation } from '../../types/messages'

const base: Record<MessagesViewer, string> = {
  customer: '/conversations',
  seller: '/seller-conversations',
  admin: '/admin/conversations',
}

export const messagesApi = {
  async list(viewer: MessagesViewer, search?: string): Promise<ConversationSummary[]> {
    const { data } = await apiClient.get<ConversationSummary[]>(base[viewer], { params: { search } })
    return data
  },

  async get(viewer: MessagesViewer, id: string): Promise<Conversation> {
    const { data } = await apiClient.get<Conversation>(`${base[viewer]}/${id}`)
    return data
  },

  async unreadCount(viewer: 'customer' | 'seller'): Promise<number> {
    const { data } = await apiClient.get<number>(`${base[viewer]}/unread-count`)
    return data
  },

  // Customers only. Returns the conversation's id.
  async start(conversation: NewConversation): Promise<string> {
    const { data } = await apiClient.post<string>(base.customer, conversation)
    return data
  },

  async reply(viewer: 'customer' | 'seller', id: string, message: string): Promise<void> {
    await apiClient.post(`${base[viewer]}/${id}/messages`, { message })
  },

  async markRead(viewer: 'customer' | 'seller', id: string): Promise<void> {
    await apiClient.post(`${base[viewer]}/${id}/read`)
  },
}
