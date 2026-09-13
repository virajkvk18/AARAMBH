"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ShieldCheck,
  UserCog,
  X,
  Zap,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDemoRole, DEMO_ROLE_CONFIG, type DemoRole } from "@/context/DemoRoleContext";
import { useEnterpriseStore } from "@/store/enterpriseStore";

const ROLE_OPTIONS: {
  role: DemoRole;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
  route: string;
}[] = [
  {
    role: "APPLICANT",
    icon: Briefcase,
    blurb: "Applicant Dashboard",
    route: "/dashboard",
  },
  {
    role: "OFFICER",
    icon: ShieldCheck,
    blurb: "Officer Review Console",
    route: "/dashboard/officer-workspace",
  },
  {
    role: "ADMIN",
    icon: UserCog,
    blurb: "Admin Governance Dashboard",
    route: "/dashboard",
  },
];

export default function QuickDemoSwitcher() {
  const { user, switchRole } = useAuth();
  const { demoRole, setDemoRole, open, setOpen } = useDemoRole();
  const router = useRouter();

  // A real authenticated account (Supabase UUID id) is pinned to the role it
  // registered with. Demo sessions (no session or demo-* id) may switch freely.
  const isDemoSession = !user || user.id.startsWith("demo-");

  const handleSwitch = (role: DemoRole) => {
    if (!isDemoSession) {
      // Real user: local role switching is disabled. Offer sign-in as that
      // role instead so the officer nav/pages only unlock via real auth.
      setOpen(false);
      if (role === "OFFICER") {
        router.push("/login?role=OFFICER");
      } else if (role === "ADMIN") {
        router.push("/login");
      }
      return;
    }

    // Seed the demo workspace with the rules-engine sample project so the
    // applicant / officer dashboards render fully-populated instantly.
    if (role === "APPLICANT" && !useEnterpriseStore.getState().isAssessed) {
      useEnterpriseStore.getState().loadSampleProfile();
    }
    if (role === "OFFICER") {
      if (user?.role !== "OFFICER") {
        switchRole("OFFICER");
      }
      setDemoRole(role);
      router.push("/dashboard/officer-workspace");
    } else if (role === "APPLICANT") {
      if (user?.role !== "APPLICANT") {
        switchRole("APPLICANT");
      }
      setDemoRole(role);
      router.push("/dashboard");
    } else {
      // ADMIN: governance view reuses the officer console shell so the
      // existing DAG / RLS-backed flows render without a genuine ADMIN role.
      if (user?.role !== "OFFICER") {
        switchRole("OFFICER");
      }
      setDemoRole(role);
      router.push("/dashboard");
    }
    setOpen(false);
  };

  const active = DEMO_ROLE_CONFIG[demoRole];

  return (
    <div className="fixed bottom-4 left-4 z-[90]">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="w-72 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl shadow-black/40 p-3.5 text-slate-100"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FE7251]/15 text-[#FE7251] text-[10px] font-black uppercase tracking-widest ring-1 ring-[#FE7251]/40">
                  <Zap className="w-3 h-3" />
                  Quick Demo Switcher
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close demo switcher"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {ROLE_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isActive = demoRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => handleSwitch(opt.role)}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isActive
                        ? "border-[#FE7251] bg-[#FE7251]/15"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/80"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-[#FE7251] text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-100 truncate">
                        {DEMO_ROLE_CONFIG[opt.role].label}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate">
                        {opt.blurb}
                      </span>
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-[#FE7251]">
                        <Star className="w-3 h-3 fill-[#FE7251]" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-2.5 text-[9px] leading-relaxed text-slate-500 border-t border-slate-800 pt-2">
              {isDemoSession
                ? "Demo evaluation mode — switches the local context view without a re-authentication HTTP redirect. Production role is governed by Supabase profiles & RLS."
                : "Signed-in accounts are scoped to their registered role. Officer access requires signing in as a verified officer."}
            </p>
          </motion.div>
        ) : (
          <motion.button
            key="chip"
            type="button"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-full border border-slate-700 bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/30 hover:bg-slate-900 transition-colors cursor-pointer text-slate-100"
            title="Quick Demo Switcher"
          >
            <span className="w-5 h-5 rounded-full bg-[#FE7251] text-white flex items-center justify-center">
              <Zap className="w-3 h-3" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              QUICK DEMO SWITCHER
            </span>
            <span
              className={`w-2 h-2 rounded-full ring-2 ${active.accentRing}`}
            />
            <span className="text-[11px] font-bold text-white">
              {active.shortLabel}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}