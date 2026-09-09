import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotificationStore, Notification } from '@/store/notificationStore';

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const router = useRouter();

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    router.push(n.target);
    onClose();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
        {unreadCount > 0 && <span className="text-xs font-medium text-slate-500">{unreadCount} unread</span>}
      </div>
      <ul className="divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <li className="p-4 text-center text-xs text-slate-500">No new notifications</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-orange-50/30' : ''}`}
              onClick={() => handleClick(n)}
            >
              <div className="flex items-start space-x-2.5">
                {n.severity === 'critical' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-xs text-slate-900">{n.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <button
                    type="button"
                    className="mt-1.5 text-[11px] font-medium text-[#FE7251] hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
