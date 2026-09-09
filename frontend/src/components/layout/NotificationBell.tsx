import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = useNotificationStore((state) => state.unreadCount());

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block mr-4">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        className="p-2 rounded-full text-[#E0C7BC] hover:text-white hover:bg-[#250C19] focus:outline-none"
        onClick={toggle}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full shadow-lg">
            {unread}
          </span>
        )}
      </button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
