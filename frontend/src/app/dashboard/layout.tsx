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
  CalendarCheck,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, toggleRole, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOfficer = user?.role === "officer";

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
    aliases?: string[];
    id?: string;
  }

  interface NavSection {
    heading: string;
    items: NavItem[];
  }

  // Role‑based navigation configuration with investor‑friendly labels and grouped sections
  const businessSections: NavSection[] = [
    {
      heading: "MAIN",
      items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      heading: "APPLICATION",
      items: [
        { label: "Know Your Approvals", href: "/dashboard/kya", icon: Compass },
        { label: "Unified CAF (One-Form)", href: "/dashboard/caf", icon: FileSpreadsheet, badge: "New" },
      ],
    },
    {
      heading: "DOCUMENTS",
      items: [{ label: "My Documents", href: "/dashboard/vault", icon: FolderLock, aliases: ["/dashboard/document-vault"] }],
    },
    {
      heading: "TRACK",
      items: [
        { label: "Application Check", href: "/dashboard/prevalidation", icon: FileCheck2, aliases: ["/dashboard/pre-validation"] },
        { label: "Track Approvals", href: "/dashboard/dag", icon: GitFork, aliases: ["/dashboard/workflows"] },
        { label: "Application Status", href: "/dashboard/sla", icon: Clock, aliases: ["/dashboard/sla-tracker"] },
        { label: "Joint Inspections", href: "/dashboard/inspections", icon: CalendarCheck },
      ],
    },
    {
      heading: "SUPPORT",
      items: [{ label: "Help & Support", href: "/dashboard/grievances", icon: MessageSquareWarning }],
    },
    {
      heading: "BUSINESS",
      items: [{ label: "Business Profile", href: "/dashboard/profile", icon: User }],
    },
  ];

  const ministrySections: NavSection[] = [
    {
      heading: "WORK QUEUE",
      items: [{ label: "Pending Reviews", href: "/dashboard/officer-workspace", icon: ShieldAlert, badge: "Officer", highlight: true }],
    },
    {
      heading: "APPLICATIONS",
      items: [
        { label: "All Applications", href: "/dashboard", icon: LayoutDashboard },
        { label: "Master CAF Dossiers", href: "/dashboard/caf", icon: FileSpreadsheet, badge: "Gateway" },
      ],
    },
    {
      heading: "VERIFICATION",
      items: [
        { label: "Document Verification", href: "/dashboard/vault", icon: FolderLock, aliases: ["/dashboard/document-vault"] },
        { label: "Application Review", href: "/dashboard/prevalidation", icon: FileCheck2, aliases: ["/dashboard/pre-validation"] },
        { label: "Joint Site Inspections", href: "/dashboard/inspections", icon: CalendarCheck },
      ],
    },
    {
      heading: "APPROVALS",
      items: [
        { id: "track-approvals", label: "Track Approvals", href: "/dashboard/dag", icon: GitFork, aliases: ["/dashboard/workflows"] },
        { id: "department-approvals", label: "Department Approvals", href: "/dashboard/department-approvals", icon: GitFork },
      ],
    },
    {
      heading: "MONITORING",
      items: [{ label: "Application Status", href: "/dashboard/sla", icon: Clock, aliases: ["/dashboard/sla-tracker"] }],
    },
    {
      heading: "SUPPORT",
      items: [
        { id: "help-support", label: "Help & Support", href: "/dashboard/help-support", icon: MessageSquareWarning },
        { id: "grievances", label: "Grievances", href: "/dashboard/grievances", icon: MessageSquareWarning },
      ],
    },
    {
      heading: "DEPARTMENT",
      items: [{ label: "Department Profile", href: "/dashboard/profile", icon: User }],
    },
  ];

  const sections = isOfficer ? ministrySections : businessSections;

  // Helper to determine active state
  const isItemActive = (item: NavItem) => {
    // Exact match for the route or its alias ensures only one sidebar item is active at a time
    if (item.href === "/dashboard") {
      return pathname === "/dashboard";
    }
    const exactMatch = pathname === item.href;
    const aliasMatch = item.aliases?.some((a) => pathname === a);
    return exactMatch || !!aliasMatch;
  };

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
        className={`fixed lg:sticky top-20 z-40 h-[calc(100vh-80px)] bg-[#16060E] text-[#E0C7BC] border-r border-[#36101E] transition-all duration-200 flex flex-col justify-between ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Top Header in Sidebar */}
        <div>
          <div className="p-4 border-b border-[#36101E] flex items-center justify-between">
            <div className={`flex items-center space-x-2.5 overflow-hidden ${collapsed ? "lg:hidden" : "block"}`}>
                <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-12 h-12 object-contain" />
              <div className="truncate">
                <p className="text-xs font-bold text-white tracking-wide truncate">
                  {user?.role === "officer" ? "OFFICER CONSOLE" : "INVESTOR PORTAL"}
                </p>
                <p className="text-[10px] text-[#FFCA7C] truncate">Maharashtra Single Window</p>
              </div>
            </div>

            {collapsed && (
              <div className="hidden lg:flex items-center justify-center">
                <img src="/aarambh-logo-new.png" alt="AARAMBH Logo" className="w-8 h-8 object-contain" />
              </div>
            )}

            {/* Collapse / Expand Toggle button (Desktop) */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-[#C4A89C] hover:text-white hover:bg-[#250C19] transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#C4A89C] hover:text-white hover:bg-[#250C19]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with grouped sections */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {sections.map((section, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-xs font-medium text-[#FFCA7C] mt-2 mb-1 px-2">
                  {section.heading}
                </p>
                {section.items.map((item) => {
                  const IconComp = item.icon;
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.id ?? item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? "bg-gradient-to-r from-[#9B2A48] to-[#FE7251] text-white shadow-md shadow-[#9B2A48]/30"
                          : item.highlight
                          ? "text-[#FFCA7C] hover:bg-[#250C19] border border-[#521C35]"
                          : "text-[#E0C7BC] hover:text-white hover:bg-[#250C19]"
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <IconComp
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white" : item.highlight ? "text-[#FE7251]" : "text-[#C4A89C] group-hover:text-[#FE7251]"
                          }`}
                        />
                        <span className={`truncate ${collapsed ? "lg:hidden" : "block"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.badge && !collapsed && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isActive
                              ? "bg-[#16060E] text-[#FFCA7C]"
                              : item.badge === "Officer"
                              ? "bg-[#250C19] text-[#FFCA7C] border border-[#521C35]"
                              : "bg-[#250C19] text-[#FE7251] border border-[#521C35]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="p-3 border-t border-[#36101E] bg-[#0D0307]">
          <div className={`flex items-center justify-between ${collapsed ? "lg:flex-col lg:gap-2" : ""}`}>
            <div className={`flex items-center space-x-2.5 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-[#250C19] border border-[#521C35] flex items-center justify-center font-bold text-xs text-[#FFCA7C] shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Guest User"}</p>
                <p className="text-[10px] text-[#C4A89C] truncate capitalize">{user?.role || "Applicant"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={toggleRole}
                className="p-1.5 rounded-lg text-[#FFCA7C] hover:bg-[#250C19] text-[10px] font-bold border border-[#521C35] transition-colors"
                title="Switch between Investor and Officer demo perspective"
              >
                {user?.role === "officer" ? "Switch to Investor" : "Switch to Officer"}
              </button>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-[#C4A89C] hover:text-[#FE7251] hover:bg-[#250C19] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile Bar */}
        <div className="lg:hidden bg-white border-b border-[#F0E5E0] px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-[#9B2A48] hover:bg-[#FFF7F0] flex items-center space-x-2"
          >
            <Menu className="w-5 h-5 text-[#9B2A48]" />
            <span className="text-xs font-bold text-[#16060E]">Workspace Menu</span>
          </button>

          <button
            type="button"
            className="text-xs font-bold text-[#9B2A48] bg-[#FFF2DF] border border-[#FED17A] px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#FFE8CC] transition-colors"
            title="Toggle between Investor and Officer perspective"
            onClick={toggleRole}
          >
            {user?.role === "officer" ? "Officer View (Switch)" : "Investor View (Switch)"}
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
