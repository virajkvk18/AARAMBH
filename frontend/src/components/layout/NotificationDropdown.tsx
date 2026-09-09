import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const router = useRouter();

  const handleClick = (n: any) => {
    if (!n.read) markAsRead(n.id);
    router.push(n.target);
    onClose();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      <ul className="divide-y divide-gray-100">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`p-3 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-gray-50' : ''}`}
            onClick={() => handleClick(n)}
          >
            <div className="flex items-start space-x-2">
              {n.severity === 'critical' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-gray-600">{n.message}</p>
                <button
                  type="button"
                  className="mt-1 text-xs text-[#FE7251] hover:underline"
                >
                  View SLA Tracker
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
