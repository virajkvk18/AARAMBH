"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type DemoRole = "APPLICANT" | "OFFICER" | "ADMIN";

export interface DemoRoleConfig {
  role: DemoRole;
  label: string;
  shortLabel: string;
  accentRing: string;
}

export const DEMO_ROLE_CONFIG: Record<DemoRole, DemoRoleConfig> = {
  APPLICANT: {
    role: "APPLICANT",
    label: "Entrepreneur / MSME Citizen",
    shortLabel: "Investor",
    accentRing: "ring-emerald-400",
  },
  OFFICER: {
    role: "OFFICER",
    label: "Government Review Officer",
    shortLabel: "Officer",
    accentRing: "ring-amber-400",
  },
  ADMIN: {
    role: "ADMIN",
    label: "System Administrator",
    shortLabel: "Admin",
    accentRing: "ring-sky-400",
  },
};

interface DemoRoleContextType {
  demoRole: DemoRole;
  setDemoRole: (role: DemoRole) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DemoRoleContext = createContext<DemoRoleContextType | undefined>(undefined);

const STORAGE_KEY = "aarambh_demo_role";

function readInitialRole(): DemoRole {
  if (typeof window === "undefined") return "APPLICANT";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as DemoRole | null;
    if (stored && stored in DEMO_ROLE_CONFIG) return stored;
    const activeRole = window.localStorage.getItem("aarambh_active_role");
    if (activeRole === "OFFICER") return "OFFICER";
  } catch {
    // ignore storage errors
  }
  return "APPLICANT";
}

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  // Initialize deterministically so the server render and the client's first
  // (hydration) render are identical. The persisted role is re-read in an
  // effect after mount, when browser-only localStorage is safe to access.
  const [demoRole, setDemoRoleState] = useState<DemoRole>("APPLICANT");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Re-hydrate the persisted role only after mount, when browser-only
    // localStorage is safe to read. Deferred so the first client render is
    // identical to the server render (deterministic hydration).
    const id = setTimeout(() => {
      setDemoRoleState(readInitialRole());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const setDemoRole = useCallback((role: DemoRole) => {
    setDemoRoleState(role);
    try {
      window.localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.demoRole = demoRole;
  }, [demoRole]);

  return (
    <DemoRoleContext.Provider value={{ demoRole, setDemoRole, open, setOpen }}>
      {children}
    </DemoRoleContext.Provider>
  );
}

export function useDemoRole() {
  const ctx = useContext(DemoRoleContext);
  if (!ctx) {
    throw new Error("useDemoRole must be used within DemoRoleProvider");
  }
  return ctx;
}