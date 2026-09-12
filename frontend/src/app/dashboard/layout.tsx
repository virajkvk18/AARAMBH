"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  CalendarCheck,
  FileSpreadsheet,
  TrendingDown,
  Landmark,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, switchRole } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitles: Record<string, string> = {
    "/dashboard": "Overview | AARAMBH",
    "/dashboard/kya": "Know Your Approvals | AARAMBH",
    "/dashboard/caf": "Application Form | AARAMBH",
    "/dashboard/vault": "Document Vault | AARAMBH",
    "/dashboard/prevalidation": "Check My Application | AARAMBH",
    "/dashboard/dag": "Approval Tracker | AARAMBH",
    "/dashboard/sla": "Timeline & Alerts | AARAMBH",
    "/dashboard/analytics": "Delay Analytics | AARAMBH",
    "/dashboard/inspections": "Inspections | AARAMBH",
    "/dashboard/renewals": "Statutory Renewals | AARAMBH",
    "/dashboard/grievances": "Help & Grievances | AARAMBH",
    "/dashboard/profile": "My Business Profile | AARAMBH",
    "/dashboard/officer-workspace": "Officer Review | AARAMBH",
    "/dashboard/department-approvals": "Department View | AARAMBH",
  };
  const currentTitle = pageTitles[pathname] || "Dashboard | AARAMBH";
  usePageTitle(currentTitle);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user) {
    return (
      <div className="h-[calc(100vh-96px)] sm:h-[calc(100vh-104px)] h-[calc(100dvh-96px)] sm:h-[calc(100dvh-104px)] bg-slate-50 flex items-center justify-center" aria-busy="true">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FE7251] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Loading workspace...</span>
        </div>
      </div>
    );
  }

  const isOfficer = user?.role === "OFFICER";

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    aliases?: string[];
    id?: string;
  }

  interface NavSection {
    heading: string;
    items: NavItem[];
  }

  // Role-based navigation configuration
  const businessSections: NavSection[] = [
    {
      heading: "Overview",
      items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      heading: "Application",
      items: [
        { label: "Know Your Approvals", href: "/dashboard/kya", icon: Compass },
        { label: "Application Form", href: "/dashboard/caf", icon: FileSpreadsheet },
      ],
    },
    {
      heading: "Documents",
      items: [{ label: "Document Vault", href: "/dashboard/vault", icon: FolderLock, aliases: ["/dashboard/document-vault"] }],
    },
    {
      heading: "Tracking & Compliance",
      items: [
        { label: "Check My Application", href: "/dashboard/prevalidation", icon: FileCheck2, aliases: ["/dashboard/pre-validation"] },
        { label: "Approval Tracker", href: "/dashboard/dag", icon: GitFork, aliases: ["/dashboard/workflows"] },
        { label: "Timeline & Alerts", href: "/dashboard/sla", icon: Clock, aliases: ["/dashboard/sla-tracker"] },
        { label: "Delay Analytics", href: "/dashboard/analytics", icon: TrendingDown },
        { label: "Inspections", href: "/dashboard/inspections", icon: CalendarCheck },
        { label: "Statutory Renewals", href: "/dashboard/renewals", icon: RotateCcw },
      ],
    },
    {
      heading: "Support & Account",
      items: [
        { label: "Help & Grievances", href: "/dashboard/grievances", icon: MessageSquareWarning },
        { label: "My Business Profile", href: "/dashboard/profile", icon: User },
      ],
    },
  ];

  const ministrySections: NavSection[] = [
    {
      heading: "Work Queue",
      items: [{ label: "Officer Review", href: "/dashboard/officer-workspace", icon: ShieldAlert }],
    },
    {
      heading: "Applications",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Application Form", href: "/dashboard/caf", icon: FileSpreadsheet },
      ],
    },
    {
      heading: "Verification",
      items: [
        { label: "Document Vault", href: "/dashboard/vault", icon: FolderLock, aliases: ["/dashboard/document-vault"] },
        { label: "Check My Application", href: "/dashboard/prevalidation", icon: FileCheck2, aliases: ["/dashboard/pre-validation"] },
        { label: "Inspections", href: "/dashboard/inspections", icon: CalendarCheck },
      ],
    },
    {
      heading: "Approvals",
      items: [
        { id: "track-approvals", label: "Approval Tracker", href: "/dashboard/dag", icon: GitFork, aliases: ["/dashboard/workflows"] },
        { label: "Department View", href: "/dashboard/department-approvals", icon: Landmark },
      ],
    },
    {
      heading: "Monitoring",
      items: [
        { label: "Timeline & Alerts", href: "/dashboard/sla", icon: Clock, aliases: ["/dashboard/sla-tracker"] },
        { label: "Delay Analytics", href: "/dashboard/analytics", icon: TrendingDown },
      ],
    },
    {
      heading: "Support",
      items: [
        { id: "grievances", label: "Help & Grievances", href: "/dashboard/grievances", icon: MessageSquareWarning },
        { label: "My Business Profile", href: "/dashboard/profile", icon: User },
      ],
    },
  ];

  const sections = isOfficer ? ministrySections : businessSections;

  const isItemActive = (item: NavItem) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard";
    }
    const exactMatch = pathname === item.href;
    const aliasMatch = item.aliases?.some((a) => pathname === a);
    return exactMatch || !!aliasMatch;
  };

  return (
    <div className="h-[calc(100vh-96px)] sm:h-[calc(100vh-104px)] h-[calc(100dvh-96px)] sm:h-[calc(100dvh-104px)] w-full bg-slate-50 flex overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT PERSISTENT SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full bg-white text-slate-700 border-r border-slate-200 transition-all duration-200 flex flex-col justify-between shrink-0 lg:static lg:inset-auto lg:z-20 lg:h-full ${
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-18" : "lg:w-64"}`}
      >
        {/* Top Header in Sidebar */}
        <div className="flex flex-col min-h-0 flex-1">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className={`flex items-center justify-between w-full overflow-hidden ${collapsed ? "lg:hidden" : "flex"}`}>
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE7251] border border-orange-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {isOfficer ? "GOV" : "ENT"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 tracking-tight truncate">
                    {user?.role === "OFFICER" ? "Officer Console" : "Investor Workspace"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Maharashtra Single Window</p>
                </div>
              </div>
            </div>

            {collapsed && (
              <div className="hidden lg:flex items-center justify-center mx-auto">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE7251] border border-orange-200 flex items-center justify-center font-bold text-xs">
                  {isOfficer ? "GOV" : "ENT"}
                </div>
              </div>
            )}

            {/* Collapse / Expand Toggle button (Desktop) */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DEMO / EVALUATION ROLE TOGGLE */}
          {!collapsed && (
            <div className="px-3 pt-2.5 pb-1">
              <div className="flex items-center justify-between p-1 bg-slate-100 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    switchRole("APPLICANT");
                    router.push("/dashboard");
                  }}
                  className={`flex-1 py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer ${
                    !isOfficer
                      ? "bg-[#FE7251] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Investor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchRole("OFFICER");
                    router.push("/dashboard/officer-workspace");
                  }}
                  className={`flex-1 py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer ${
                    isOfficer
                      ? "bg-[#FE7251] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Officer
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links with grouped sections */}
          <nav className="p-2.5 space-y-3 overflow-y-auto flex-1 min-h-0">
            {sections.map((section, idx) => (
              <div key={idx}>
                {!collapsed && (
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 mb-1">
                    {section.heading}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = isItemActive(item);
                    return (
                      <Link
                        key={item.id ?? item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center justify-between px-2.5 py-2.5 lg:py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-[#FE7251] text-white"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <IconComp
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? "text-white" : "text-slate-500"
                            }`}
                          />
                          <span className={`truncate ${collapsed ? "lg:hidden" : "block"}`}>
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0">
          <div className={`flex items-center justify-between ${collapsed ? "lg:flex-col lg:gap-2" : ""}`}>
            <div className={`flex items-center space-x-2.5 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-900 truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role || "Applicant"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Mobile Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center space-x-2 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-slate-700" />
            <span className="text-xs font-semibold text-slate-900">Menu</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => {
                const target = isOfficer ? "APPLICANT" : "OFFICER";
                switchRole(target);
                router.push(target === "OFFICER" ? "/dashboard/officer-workspace" : "/dashboard");
              }}
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to toggle perspective"
            >
              <span className={`w-2 h-2 rounded-full ${isOfficer ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span>{isOfficer ? "Officer View (Switch)" : "Investor View (Switch)"}</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
