import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  CheckCheck,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useNotificationStore, Notification, NotificationSeverity } from '@/store/notificationStore';

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSeverityBadge(severity: NotificationSeverity) {
  switch (severity) {
    case 'welcome':
      return {
        icon: Sparkles,
        iconColor: 'text-purple-600',
        bgClass: 'bg-purple-50 border-purple-200 text-purple-700',
        label: 'Welcome',
      };
    case 'success':
      return {
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        label: 'Success',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        bgClass: 'bg-amber-50 border-amber-200 text-amber-700',
        label: 'Alert',
      };
    case 'critical':
      return {
        icon: AlertCircle,
        iconColor: 'text-rose-600',
        bgClass: 'bg-rose-50 border-rose-200 text-rose-700',
        label: 'Urgent',
      };
    default:
      return {
        icon: Info,
        iconColor: 'text-sky-600',
        bgClass: 'bg-sky-50 border-sky-200 text-sky-700',
        label: 'Update',
      };
  }
}

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);
  const router = useRouter();

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.target) {
      router.push(n.target);
    }
    onClose();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
          {unreadCount > 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#FE7251] text-white">
              {unreadCount} NEW
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">All caught up</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto divide-y divide-slate-100 max-h-[420px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No Notifications</p>
            <p className="text-[11px] text-slate-400 max-w-[200px]">
              You will receive real-time updates as clearances and forms progress.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const badge = getSeverityBadge(n.severity);
            const IconComp = badge.icon;

            return (
              <div
                key={n.id}
                className={`p-4 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-start space-x-3 relative ${
                  !n.read ? 'bg-[#FFF9F5]' : ''
                }`}
                onClick={() => handleClick(n)}
              >
                {!n.read && (
                  <div className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-[#FE7251]" />
                )}

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${badge.bgClass}`}
                >
                  <IconComp className={`w-4 h-4 ${badge.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-xs text-slate-900 truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {getTimeAgo(n.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badge.bgClass}`}
                    >
                      {badge.label}
                    </span>

                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#FE7251] hover:underline">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
