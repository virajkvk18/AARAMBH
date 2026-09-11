import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NotificationSeverity = 'critical' | 'info' | 'success' | 'warning' | 'welcome';

export interface Notification {
  id: string;
  type: string; // 'welcome' | 'kya' | 'caf' | 'vault' | 'prevalidation' | 'dag' | 'sla' | 'grievance'
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: number;
  target: string; // route to navigate
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  activeToast: Notification | null;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'notif-welcome-init',
          type: 'welcome',
          title: 'Welcome to AARAMBH Single Window Portal 🇮🇳',
          message: 'Your industrial investor portal is active. Start with the KYA Wizard to discover mandatory state clearances and subsidies.',
          severity: 'welcome',
          timestamp: Date.now(),
          target: '/dashboard/kya',
          read: false,
        },
        {
          id: 'sla-midc-001',
          type: 'sla',
          title: 'MIDC Statutory Clearance Tracking',
          message: 'Maharashtra Right to Public Services Act (RTS 2015) deemed approval timer is actively monitoring all submitted clearances.',
          severity: 'info',
          timestamp: Date.now() - 3600000,
          target: '/dashboard/sla',
          read: false,
        },
      ],
      activeToast: null,
      addNotification: (n) => {
        const newNotif: Notification = {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          activeToast: newNotif,
        }));
      },
      dismissToast: () => set({ activeToast: null }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [], activeToast: null }),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'aarambh_notification_store', storage: createJSONStorage(() => localStorage) }
  )
);
