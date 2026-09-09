import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = useNotificationStore((state) => state.unreadCount());

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-hidden"
        onClick={toggle}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute 0 top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#FE7251] rounded-full">
            {unread}
          </span>
        )}
      </button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
