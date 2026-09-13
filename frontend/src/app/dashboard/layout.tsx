"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDemoRole } from "@/context/DemoRoleContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import SidebarNav from "@/components/navigation/SidebarNav";
import {
  NAV_BY_ROLE,
  OFFICER_ONLY_ROUTES,
  type RoleId,
} from "@/components/navigation/navConfig";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, switchRole } = useAuth();
  const { demoRole } = useDemoRole();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Real authenticated accounts (Supabase UUID id) are pinned to the role they
  // registered with. Demo sessions (no session or demo-* id) may adopt the
  // evaluation role from the DemoRoleContext.
  const isDemoSession = !user || user.id.startsWith("demo-");

  const effectiveRole: RoleId =
    user?.role === "ADMIN" || (isDemoSession && demoRole === "ADMIN")
      ? "ADMIN"
      : user?.role === "OFFICER"
      ? "OFFICER"
      : "APPLICANT";

  const isApplicant = effectiveRole === "APPLICANT";
  const isOfficer = effectiveRole === "OFFICER";
  const isAdmin = effectiveRole === "ADMIN";

  // Real accounts cannot jump roles client-side — send them to sign-in so the
  // switch is backed by a genuine officer registration / session.
  const handleRoleSelect = (target: "APPLICANT" | "OFFICER") => {
    setMobileOpen(false);
    if (!isDemoSession) {
      router.push(`/login?role=${target}`);
      return;
    }
    switchRole(target);
    router.push(target === "OFFICER" ? "/dashboard/officer-workspace" : "/dashboard");
  };

  const pageTitles: Record<string, string> = {
    "/dashboard": "Overview | AARAMBH",
    "/dashboard/kya": "Policy & Approvals Search | AARAMBH",
    "/dashboard/caf": "Application Form | AARAMBH",
    "/dashboard/vault": "Document Vault | AARAMBH",
    "/dashboard/prevalidation": "My Clearances & Applications | AARAMBH",
    "/dashboard/dag": "Approval Roadmap (DAG) | AARAMBH",
    "/dashboard/sla": "SLA Tracker | AARAMBH",
    "/dashboard/sla-tracker": "SLA Tracker | AARAMBH",
    "/dashboard/analytics": "SLA & Delay Alerts | AARAMBH",
    "/dashboard/inspections": "Joint Site Inspections | AARAMBH",
    "/dashboard/renewals": "Compliance Calendar | AARAMBH",
    "/dashboard/incentives": "Incentives & Schemes | AARAMBH",
    "/dashboard/grievances": "Help & Grievances | AARAMBH",
    "/dashboard/profile": "My Business Profile | AARAMBH",
    "/dashboard/officer-workspace": "Scrutiny Work Queue | AARAMBH",
    "/dashboard/department-approvals": "Department View | AARAMBH",
  };
  const currentTitle = pageTitles[pathname] || "Dashboard | AARAMBH";
  usePageTitle(currentTitle);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [isLoading, pathname, router, user]);

  // Role-scope route guard: an applicant who hand-types an officer-only URL is
  // redirected to their role home WITHOUT mutating the session role. Officer /
  // Admin roles may access the protected routes.
  useEffect(() => {
    if (isLoading || !user) return;
    const blocked = OFFICER_ONLY_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(`${r}/`)
    );
    if (blocked && !isOfficer && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [effectiveRole, pathname, router, isLoading, user, isOfficer, isAdmin]);

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

  const sections = NAV_BY_ROLE[effectiveRole];

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
                  {isOfficer || isAdmin ? "GOV" : "ENT"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 tracking-tight truncate">
                    {isOfficer ? "Officer Console" : isAdmin ? "Admin Console" : "Investor Workspace"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Maharashtra Single Window</p>
                </div>
              </div>
            </div>

            {collapsed && (
              <div className="hidden lg:flex items-center justify-center mx-auto">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE7251] border border-orange-200 flex items-center justify-center font-bold text-xs">
                  {isOfficer || isAdmin ? "GOV" : "ENT"}
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
                  onClick={() => handleRoleSelect("APPLICANT")}
                  className={`flex-1 py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer ${
                    isApplicant
                      ? "bg-[#FE7251] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Investor
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("OFFICER")}
                  className={`flex-1 py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer ${
                    isOfficer || isAdmin
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
          <SidebarNav
            sections={sections}
            collapsed={collapsed}
            onNavigate={() => setMobileOpen(false)}
          />
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
                const target = isOfficer || isAdmin ? "APPLICANT" : "OFFICER";
                if (!isDemoSession) {
                  router.push(`/login?role=${target}`);
                  return;
                }
                switchRole(target);
                router.push(target === "OFFICER" ? "/dashboard/officer-workspace" : "/dashboard");
              }}
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to toggle perspective"
            >
              <span className={`w-2 h-2 rounded-full ${isOfficer || isAdmin ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span>{isOfficer || isAdmin ? "Officer View (Switch)" : "Investor View (Switch)"}</span>
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
