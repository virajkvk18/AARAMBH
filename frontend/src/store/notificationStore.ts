import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NotificationSeverity = 'critical' | 'info' | 'success' | 'warning';

export interface Notification {
  id: string;
  type: string; // e.g., 'sla'
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: number;
  target: string; // route to navigate
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'sla-fire-001',
          type: 'sla',
          title: 'Critical Warning',
          message: 'Fire NOC application MH-CAF-2026-00412 has reached 90% SLA threshold. Escalation dispatched to HOD.',
          severity: 'critical',
          timestamp: Date.now(),
          target: '/dashboard/sla',
          read: false,
        },
        {
          id: 'sla-midc-001',
          type: 'sla',
          title: 'Deemed Approval',
          message: 'MIDC Land Allotment has elapsed statutory timeline and transitioned to Deemed Clearance.',
          severity: 'info',
          timestamp: Date.now(),
          target: '/dashboard/sla',
          read: false,
        },
      ],
      addNotification: (n) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...n, id: `notif-${Math.random().toString(36).substr(2,9)}`, timestamp: Date.now(), read: false },
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'notification-store', storage: createJSONStorage(() => localStorage) }
  )
);
