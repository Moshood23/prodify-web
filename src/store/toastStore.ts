import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
  link?: { to: string; label: string }
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

const TOAST_DURATION_MS = 4000
let nextId = 1

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show(toast) {
    const id = nextId++
    // Keep at most 3 on screen.
    set({ toasts: [...get().toasts.slice(-2), { ...toast, id }] })
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS)
  },

  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))