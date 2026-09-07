"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FolderLock,
  FileCheck2,
  GitFork,
  Clock,
  ShieldAlert,
  MessageSquareWarning,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Building2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOfficer = user?.role === "officer";
  // Demo role toggle for development
  const [demoIsOfficer, setDemoIsOfficer] = useState(false);

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
  }

  // Role‑based navigation configuration
  const navigationConfig: Record<string, NavItem[]> = {
    business: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Find My Approvals", href: "/dashboard/kya", icon: Compass },
      { label: "My Documents", href: "/dashboard/vault", icon: FolderLock },
      { label: "Check & Validate", href: "/dashboard/prevalidation", icon: FileCheck2 },
      { label: "Approval Journey", href: "/dashboard/dag", icon: GitFork },
      { label: "Track Progress", href: "/dashboard/sla", icon: Clock },
      { label: "Help & Support", href: "/dashboard/grievances", icon: MessageSquareWarning },
      { label: "Business Profile", href: "/dashboard/profile", icon: User },
    ],
    ministry: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Applications", href: "/dashboard/kya", icon: Compass },
      { label: "Document Review", href: "/dashboard/vault", icon: FolderLock },
      { label: "Validation Queue", href: "/dashboard/prevalidation", icon: FileCheck2 },
      { label: "Approval Workflow", href: "/dashboard/dag", icon: GitFork },
      { label: "SLA Monitoring", href: "/dashboard/sla", icon: Clock },
      { label: "Grievances", href: "/dashboard/grievances", icon: MessageSquareWarning },
      { label: "Department Profile", href: "/dashboard/profile", icon: User },
    ],
  };

  // Determine current role (demo switcher can modify this)
  const currentRole = demoIsOfficer ? "ministry" : "business";
  const navItems = navigationConfig[currentRole];

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] flex">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT PERSISTENT SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-20 z-40 h-[calc(100vh-80px)] bg-[#0F172A] text-slate-300 border-r border-slate-800 transition-all duration-200 flex flex-col justify-between ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Top Header in Sidebar */}
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className={`flex items-center space-x-2.5 overflow-hidden ${collapsed ? "lg:hidden" : "block"}`}>
                <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-12 h-12 object-contain" />
              <div className="truncate">
                <p className="text-xs font-bold text-white tracking-wide truncate">
                  {user?.role === "officer" ? "OFFICER CONSOLE" : "INVESTOR PORTAL"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Maharashtra Single Window</p>
              </div>
            </div>

            {/* Collapse / Expand Toggle button (Desktop) */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/20"
                      : item.highlight
                      ? "text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/40"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <IconComp
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-white" : item.highlight ? "text-emerald-400" : "text-slate-400 group-hover:text-indigo-400"
                      }`}
                    />
                    <span className={`truncate ${collapsed ? "lg:hidden" : "block"}`}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && !collapsed && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isActive
                          ? "bg-indigo-700 text-white"
                          : item.badge === "Officer"
                          ? "bg-emerald-900/80 text-emerald-300 border border-emerald-700"
                          : "bg-slate-800 text-indigo-300 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-[#0A0F1D]">
          <div className={`flex items-center justify-between ${collapsed ? "lg:flex-col lg:gap-2" : ""}`}>
            <div className={`flex items-center space-x-2.5 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Guest User"}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role || "Applicant"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center space-x-2"
          >
            <Menu className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Workspace Menu</span>
          </button>

          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer" title="Toggle demo role (Business/Ministry)" onClick={() => setDemoIsOfficer(!demoIsOfficer)}>
            {user?.role === "officer" ? "Officer View" : "Investor View"}
          </span>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
