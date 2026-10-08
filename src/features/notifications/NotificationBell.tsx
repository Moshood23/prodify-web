import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useLatestNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, useUnreadCount } from './hooks'
import { useAuthStore } from '../../store/authStore'
import { formatDateTime } from '../../lib/format'
import type { AppNotification } from '../../types/notification'

// Bell with the unread count; opens the latest notifications. Shown to customers and sellers
// (admins have no notifications). className styles the button for its header.
export function NotificationBell({ className = '' }: { className?: string }) {
  const user = useAuthStore((s) => s.user)
  const canReceive = Boolean(user?.customerId || user?.sellerId)
  const [open, setOpen] = useState(false)
  // On phones the panel spans the screen just under the bell; the header wraps, so the bell can be anywhere.
  const [phoneTop, setPhoneTop] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: unread = 0 } = useUnreadCount(canReceive)
  const { data: notifications, isLoading } = useLatestNotifications(canReceive && open)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  // Close on a click outside the panel or on Escape.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!canReceive) return null

  function toggle(button: HTMLButtonElement) {
    const isPhone = window.innerWidth < 640
    setPhoneTop(isPhone ? button.getBoundingClientRect().bottom + 8 : null)
    setOpen((o) => !o)
  }

  function openNotification(notification: AppNotification) {
    if (!notification.isRead) markRead.mutate(notification.id)
    setOpen(false)
    if (notification.link) navigate(notification.link)
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={(e) => toggle(e.currentTarget)}
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className={`relative flex items-center rounded-md p-1 ${className}`}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-ink">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={phoneTop !== null ? { top: phoneTop } : undefined}
          className="fixed inset-x-4 z-30 overflow-hidden rounded-xl border border-border bg-white text-left text-ink shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-bold">Notifications</h2>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
              >
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Loading...</p>
          ) : !notifications || notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openNotification(n)}
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-surface ${n.isRead ? '' : 'bg-primary-light/40'}`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary'}`}
                      aria-label={n.isRead ? undefined : 'Unread'}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${n.isRead ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{n.message}</span>
                      <span className="mt-1 block text-xs text-muted">{formatDateTime(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
