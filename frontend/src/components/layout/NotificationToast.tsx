'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { useNotificationStore, NotificationSeverity } from '@/store/notificationStore';

function getToastBadge(severity: NotificationSeverity) {
  switch (severity) {
    case 'welcome':
      return {
        icon: Sparkles,
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        bgColor: 'bg-white',
        tagBg: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Welcome',
      };
    case 'success':
      return {
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
        bgColor: 'bg-white',
        tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Success',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        bgColor: 'bg-white',
        tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Notice',
      };
    case 'critical':
      return {
        icon: AlertCircle,
        iconColor: 'text-rose-600',
        borderColor: 'border-rose-200',
        bgColor: 'bg-white',
        tagBg: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Urgent',
      };
    default:
      return {
        icon: Info,
        iconColor: 'text-sky-600',
        borderColor: 'border-sky-200',
        bgColor: 'bg-white',
        tagBg: 'bg-sky-50 text-sky-700 border-sky-200',
        label: 'Update',
      };
  }
}

export default function NotificationToast() {
  const activeToast = useNotificationStore((state) => state.activeToast);
  const dismissToast = useNotificationStore((state) => state.dismissToast);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const router = useRouter();

  // Auto-dismiss after 4.5 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const badge = getToastBadge(activeToast.severity);
  const IconComp = badge.icon;

  const handleAction = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.target) {
      router.push(activeToast.target);
    }
  };

  return (
    <aside
      aria-label="System notification toast"
      className="fixed top-18 sm:top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200"
    >
      <div
        className={`p-4 rounded-2xl border shadow-xl flex items-start space-x-3.5 ${badge.bgColor} ${badge.borderColor}`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badge.tagBg}`}
        >
          <IconComp className={`w-5 h-5 ${badge.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-xs text-slate-900 truncate">
              {activeToast.title}
            </h4>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badge.tagBg}`}
            >
              {badge.label}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            {activeToast.message}
          </p>

          <div className="mt-2.5 flex items-center space-x-3">
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center space-x-1 text-xs font-bold text-[#FE7251] hover:underline cursor-pointer"
            >
              <span>Open Dashboard Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
