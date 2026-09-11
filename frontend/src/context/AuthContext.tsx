"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient, isBrowserSupabaseConfigured } from "@/lib/supabase";
export interface User { name: string; email: string; role: "APPLICANT" | "OFFICER" | "ADMIN"; enterpriseId?: string; enterpriseName?: string; department?: string; isDigiLockerVerified?: boolean; phone?: string; panNumber?: string; entityType?: string; addressLine1?: string; addressLine2?: string; pinCode?: string; district?: string; state?: string; }
type Profile = Omit<User, "email" | "role">;
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: "APPLICANT" | "OFFICER", department?: string) => Promise<string | null>;
  signInWithEmailOtp: (email: string) => Promise<string | null>;
  verifyEmailOtp: (email: string, token: string) => Promise<string | null>;
  signUpApplicant: (email: string, password: string, profile: Profile) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  updateProfile: (profile: Partial<Profile>) => Promise<string | null>;
  loginWithDigiLocker: () => Promise<string>;
  loginWithGoogle: () => Promise<string>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const mapUser = (u: SupabaseUser): User => {
  const m = u.user_metadata ?? {};
  return {
    name: m.name || m.full_name || u.email?.split("@")[0] || "AARAMBH User",
    email: u.email || "",
    role: (m.role === "OFFICER" || m.role === "officer") ? "OFFICER" : "APPLICANT",
    enterpriseId: m.enterpriseId || u.id,
    enterpriseName: m.enterpriseName,
    department: m.department,
    isDigiLockerVerified: m.isDigiLockerVerified === true,
    phone: m.phone,
    panNumber: m.panNumber,
    entityType: m.entityType,
    addressLine1: m.addressLine1,
    addressLine2: m.addressLine2,
    pinCode: m.pinCode,
    district: m.district,
    state: m.state,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isBrowserSupabaseConfigured);
  const router = useRouter();

  useEffect(() => {
    const local = typeof window !== "undefined" ? localStorage.getItem("aarambh_user") : null;
    if (local) {
      try {
        setUser(JSON.parse(local));
      } catch {}
    }

    const s = getSupabaseClient();
    if (!s) {
      setIsLoading(false);
      return;
    }

    void s.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(mapUser(data.user));
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = s.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(mapUser(session.user));
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, role?: "APPLICANT" | "OFFICER", department?: string) => {
    const s = getSupabaseClient();
    if (!s) {
      if (email && password) {
        const isOfficer = role === "OFFICER" || email.toLowerCase().includes("officer");
        const demoUser: User = {
          name: isOfficer ? "Verification Officer (MIDC)" : "Authorized Signatory",
          email,
          role: isOfficer ? "OFFICER" : "APPLICANT",
          enterpriseId: "MH-ENT-2026-0881",
          enterpriseName: "Smart Electronics",
          department: isOfficer ? (department || "MIDC Industrial Clearances") : undefined,
          isDigiLockerVerified: false,
        };
        setUser(demoUser);
        localStorage.setItem("aarambh_user", JSON.stringify(demoUser));
        return null;
      }
      return "Please enter email and password.";
    }
    const { error } = await s.auth.signInWithPassword({ email, password });
    return error ? "Unable to sign in with those credentials." : null;
  };

  const signInWithEmailOtp = async (email: string) => {
    const s = getSupabaseClient();
    if (!s) {
      return "Email OTP is unavailable in demo mode — sign in with a password instead.";
    }
    const { error } = await s.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    return error ? error.message : null;
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    const s = getSupabaseClient();
    if (!s) {
      return "Email OTP is unavailable in demo mode — sign in with a password instead.";
    }
    const { error } = await s.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });
    return error ? error.message : null;
  };

  const signUpApplicant = async (email: string, password: string, profile: Profile) => {
    const s = getSupabaseClient();
    if (!s) {
      const demoUser: User = {
        email,
        role: "APPLICANT",
        ...profile,
        name: profile.name || "Authorized Signatory",
      };
      setUser(demoUser);
      localStorage.setItem("aarambh_user", JSON.stringify(demoUser));
      return { error: null, needsConfirmation: false };
    }
    const { data, error } = await s.auth.signUp({
      email,
      password,
      options: { data: { ...profile, role: "APPLICANT" } },
    });
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
  };

  const updateProfile = async (profile: Partial<Profile>) => {
    const s = getSupabaseClient();
    if (!s) {
      if (user) {
        const updated = { ...user, ...profile };
        setUser(updated);
        localStorage.setItem("aarambh_user", JSON.stringify(updated));
      }
      return null;
    }
    const { error } = await s.auth.updateUser({ data: profile });
    return error?.message ?? null;
  };

  const loginWithDigiLocker = async () => {
    const demoUser: User = {
      name: "Sanjay Deshmukh",
      email: "sanjay.deshmukh@smartelectronics.in",
      role: "APPLICANT",
      enterpriseId: "MH-ENT-2026-0881",
      enterpriseName: "Smart Electronics",
      isDigiLockerVerified: true,
      phone: "9823012345",
      panNumber: "AAECS8891M",
      entityType: "proprietor",
      addressLine1: "Plot No. A-42, Sector 10",
      addressLine2: "MIDC Chakan Phase-II",
      pinCode: "410501",
      district: "Pune",
      state: "Maharashtra",
    };
    setUser(demoUser);
    localStorage.setItem("aarambh_user", JSON.stringify(demoUser));
    return "";
  };

  const loginWithGoogle = async () => {
    const demoUser: User = {
      name: "Sanjay Deshmukh",
      email: "sanjay.deshmukh@gmail.com",
      role: "APPLICANT",
      enterpriseId: "MH-ENT-2026-0881",
      enterpriseName: "Smart Electronics",
      isDigiLockerVerified: false,
      phone: "9823012345",
      panNumber: "AAECS8891M",
      entityType: "proprietor",
      addressLine1: "Plot No. A-42, Sector 10",
      addressLine2: "MIDC Chakan Phase-II",
      pinCode: "410501",
      district: "Pune",
      state: "Maharashtra",
    };
    setUser(demoUser);
    localStorage.setItem("aarambh_user", JSON.stringify(demoUser));
    return "";
  };

  const logout = async () => {
    const s = getSupabaseClient();
    if (s) await s.auth.signOut();
    localStorage.removeItem("aarambh_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signInWithEmailOtp,
        verifyEmailOtp,
        signUpApplicant,
        updateProfile,
        loginWithDigiLocker,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error("useAuth must be used within an AuthProvider"); return c; }
