"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, NavSection } from "./navConfig";

interface SidebarNavProps {
  sections: NavSection[];
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarNav({ sections, collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard";
    }
    const exactMatch = pathname === item.href;
    const aliasMatch = item.aliases?.some((a) => pathname === a);
    return exactMatch || !!aliasMatch;
  };

  return (
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
                  onClick={onNavigate}
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
  );
}