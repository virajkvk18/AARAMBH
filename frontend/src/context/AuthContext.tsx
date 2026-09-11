"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getBrowserSupabaseClient, isSupabaseConfigured } from "@/utils/supabase/client";
import { useEnterpriseStore } from "@/store/enterpriseStore";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "APPLICANT" | "OFFICER" | "ADMIN";
  enterpriseId?: string;
  enterpriseName?: string;
  department?: string;
  isDigiLockerVerified?: boolean;
  phone?: string;
  panNumber?: string;
  entityType?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  district?: string;
  state?: string;
}

export type Profile = Omit<User, "id" | "email" | "role">;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: "APPLICANT" | "OFFICER", department?: string) => Promise<string | null>;
  signInWithEmailOtp: (email: string) => Promise<string | null>;
  signUpWithEmailOtp: (email: string) => Promise<string | null>;
  resendSignupOtp: (email: string) => Promise<string | null>;
  verifyEmailOtp: (email: string, token: string, type?: "email" | "signup") => Promise<string | null>;
  signUpApplicant: (email: string, password: string, profile: Profile) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  completeSignup: (email: string, password: string, profile: Profile) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  updateProfile: (profile: Partial<Profile>) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Helper to load profile and enterprise data from Supabase for an authenticated user
  const fetchUserData = useCallback(async (sbUser: SupabaseUser): Promise<User> => {
    const s = getBrowserSupabaseClient();
    const meta = sbUser.user_metadata || {};

    let dbProfile: Record<string, any> | null = null;
    let dbEnterprise: Record<string, any> | null = null;

    if (s) {
      try {
        const { data: profileData } = await s
          .from("profiles")
          .select("*")
          .eq("id", sbUser.id)
          .maybeSingle();
        dbProfile = profileData;
      } catch (e) {
        console.warn("Could not fetch profile from Supabase:", e);
      }

      try {
        const { data: entData } = await s
          .from("enterprises")
          .select("*")
          .eq("user_id", sbUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        dbEnterprise = entData;
      } catch (e) {
        console.warn("Could not fetch enterprise from Supabase:", e);
      }

      if (!dbEnterprise && meta.enterprise_name && s) {
        try {
          const { data: newEnt } = await s
            .from("enterprises")
            .insert({
              user_id: sbUser.id,
              name: meta.enterprise_name,
              entity_type: meta.entity_type || "Private Limited",
              pan: meta.pan_number || null,
              registered_address: {
                address: meta.address || "",
                district: meta.district || "",
                state: meta.state || "Maharashtra",
                pincode: meta.pincode || "",
              },
              sector: meta.sector || "General Manufacturing",
              is_assessed: false,
            })
            .select()
            .maybeSingle();
          if (newEnt) dbEnterprise = newEnt;
        } catch (e) {
          console.warn("Could not create initial enterprise for user:", e);
        }
      }
    }

    const roleRaw = dbProfile?.role || meta.role || "APPLICANT";
    const role: "APPLICANT" | "OFFICER" | "ADMIN" =
      roleRaw === "OFFICER" || roleRaw === "officer"
        ? "OFFICER"
        : roleRaw === "ADMIN" || roleRaw === "admin"
        ? "ADMIN"
        : "APPLICANT";

    const name =
      dbProfile?.full_name ||
      meta.full_name ||
      meta.name ||
      sbUser.email?.split("@")[0] ||
      "AARAMBH User";

    return {
      id: sbUser.id,
      name,
      email: sbUser.email || "",
      role,
      department: dbProfile?.department || meta.department,
      enterpriseId: dbEnterprise?.id || meta.enterpriseId,
      enterpriseName: dbEnterprise?.name || meta.enterpriseName,
      isDigiLockerVerified: meta.isDigiLockerVerified === true,
      phone: dbProfile?.phone || meta.phone,
      panNumber: dbEnterprise?.pan || dbProfile?.pan_number || meta.panNumber,
      entityType: dbEnterprise?.entity_type || dbProfile?.entity_type || meta.entityType,
      addressLine1: dbProfile?.address || meta.addressLine1,
      addressLine2: meta.addressLine2,
      pinCode: dbProfile?.pincode || meta.pinCode,
      district: dbProfile?.district || meta.district,
      state: dbProfile?.state || meta.state || "Maharashtra",
    };
  }, []);

  // Initialize session from Supabase
  const refreshProfile = useCallback(async () => {
    const s = getBrowserSupabaseClient();
    if (!s) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await s.auth.getSession();

      if (session?.user) {
        const appUser = await fetchUserData(session.user);
        setUser(appUser);
        useEnterpriseStore.getState().syncWithAuthUser(appUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session refresh error:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserData]);

  useEffect(() => {
    const s = getBrowserSupabaseClient();
    if (!s) {
      setIsLoading(false);
      return;
    }

    // Initial session load
    void refreshProfile();

    // Listen to real auth state changes
    const {
      data: { subscription },
    } = s.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser = await fetchUserData(session.user);
        setUser(appUser);
        useEnterpriseStore.getState().syncWithAuthUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData, refreshProfile]);

  // Sign In with email & password
  const signIn = async (
    email: string,
    password: string,
    expectedRole?: "APPLICANT" | "OFFICER",
    _department?: string
  ): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) {
      return "Supabase client is not configured. Check environment configuration.";
    }

    const { data: authData, error } = await s.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return error.message;
    }

    if (authData.user) {
      const appUser = await fetchUserData(authData.user);
      if (expectedRole === "OFFICER" && appUser.role !== "OFFICER" && appUser.role !== "ADMIN") {
        await s.auth.signOut();
        setUser(null);
        return "Access denied: This account is registered as an Investor/Applicant and does not have Officer clearance authority.";
      }
      setUser(appUser);
      useEnterpriseStore.getState().syncWithAuthUser(appUser);
    } else {
      await refreshProfile();
    }

    return null;
  };

  // Sign in with Email OTP (Existing User Login)
  const signInWithEmailOtp = async (
    email: string
  ): Promise<string | null> => {
    const s = getBrowserSupabaseClient();

    if (!s) {
      return "Supabase client is not configured.";
    }

    const { error } = await s.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
      },
    });

    return error ? error.message : null;
  };

  // Sign up with Email OTP (New User Registration)
  const signUpWithEmailOtp = async (
    email: string
  ): Promise<string | null> => {
    const s = getBrowserSupabaseClient();

    if (!s) {
      return "Supabase client is not configured.";
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return "Please enter your email address.";
    }

    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await s.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
      },
    });

    return error ? error.message : null;
  };

  // Resend 6-digit signup confirmation OTP
  const resendSignupOtp = async (email: string): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) {
      return "Supabase client is not configured.";
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return "Please enter your email address.";
    }

    const { error } = await s.auth.resend({
      type: "signup",
      email: normalizedEmail,
    });

    return error ? error.message : null;
  };

  // Verify 6-digit Email OTP (supports type: 'email' | 'signup')
  const verifyEmailOtp = async (
    email: string,
    token: string,
    type: "email" | "signup" = "email"
  ): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) {
      return "Supabase client is not configured.";
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    let { error } = await s.auth.verifyOtp({
      email: normalizedEmail,
      token: cleanToken,
      type,
    });

    // Fallback: if 'signup' failed, try 'email', and vice versa
    if (error && (type === "signup" || type === "email")) {
      const alternateType = type === "signup" ? "email" : "signup";
      const retry = await s.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanToken,
        type: alternateType,
      });
      if (!retry.error) {
        error = null;
      }
    }

    if (error) {
      return error.message;
    }

    await refreshProfile();
    return null;
  };

  // Sign up new applicant using purely Supabase Auth
  const signUpApplicant = async (
    email: string,
    password: string,
    profile: Profile
  ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    const s = getBrowserSupabaseClient();
    if (!s) {
      return { error: "Supabase client is not configured.", needsConfirmation: false };
    }

    try {
      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { data, error } = await s.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: profile.name,
            role: "APPLICANT",
            phone: profile.phone,
            entity_type: profile.entityType,
            pan_number: profile.panNumber,
            address: profile.addressLine1,
            district: profile.district,
            state: profile.state || "Maharashtra",
            pincode: profile.pinCode,
            enterprise_name: profile.enterpriseName,
          },
        },
      });

      if (error) {
        return { error: error.message, needsConfirmation: false };
      }

      if (data.session) {
        await refreshProfile();
        return { error: null, needsConfirmation: false };
      }

      if (data.user && !data.session) {
        return { error: null, needsConfirmation: true };
      }

      return { error: null, needsConfirmation: false };
    } catch (e: any) {
      return {
        error: e.message || "An unexpected error occurred during signup.",
        needsConfirmation: false,
      };
    }
  };

  // Complete signup after OTP verification
  const completeSignup = async (
    email: string,
    password: string,
    profile: Profile
  ): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) return "Supabase client is not configured.";

    if (password) {
      const { error: pwdErr } = await s.auth.updateUser({ password });
      if (pwdErr) return pwdErr.message;
    }

    return await updateProfile(profile);
  };

  // Reset Password via Email
  const resetPassword = async (email: string): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) return "Supabase client is not configured.";

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    const { error } = await s.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    return error ? error.message : null;
  };

  // Update Password for current user
  const updatePassword = async (password: string): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) return "Supabase client is not configured.";

    const { error } = await s.auth.updateUser({ password });
    return error ? error.message : null;
  };

  // Update Profile
  const updateProfile = async (profileUpdate: Partial<Profile>): Promise<string | null> => {
    const s = getBrowserSupabaseClient();
    if (!s) return "Supabase client is not configured.";

    const {
      data: { user: sbUser },
    } = await s.auth.getUser();

    if (!sbUser) return "Not authenticated.";

    // 1. Update profiles table
    const profilePayload: Record<string, any> = {};
    if (profileUpdate.name) profilePayload.full_name = profileUpdate.name;
    if (profileUpdate.phone) profilePayload.phone = profileUpdate.phone;
    if (profileUpdate.entityType) profilePayload.entity_type = profileUpdate.entityType;
    if (profileUpdate.panNumber) profilePayload.pan_number = profileUpdate.panNumber;
    if (profileUpdate.addressLine1) profilePayload.address = profileUpdate.addressLine1;
    if (profileUpdate.district) profilePayload.district = profileUpdate.district;
    if (profileUpdate.state) profilePayload.state = profileUpdate.state;
    if (profileUpdate.pinCode) profilePayload.pincode = profileUpdate.pinCode;

    if (Object.keys(profilePayload).length > 0) {
      const { error: profErr } = await s
        .from("profiles")
        .update(profilePayload)
        .eq("id", sbUser.id);
      if (profErr) console.warn("Error updating profile in Supabase:", profErr);
    }

    // 2. Update enterprise if enterprise exists
    if (user?.enterpriseId) {
      const enterprisePayload: Record<string, any> = {};
      if (profileUpdate.enterpriseName) enterprisePayload.name = profileUpdate.enterpriseName;
      if (profileUpdate.entityType) enterprisePayload.entity_type = profileUpdate.entityType;
      if (profileUpdate.panNumber) enterprisePayload.pan = profileUpdate.panNumber;

      if (Object.keys(enterprisePayload).length > 0) {
        const { error: entErr } = await s
          .from("enterprises")
          .update(enterprisePayload)
          .eq("id", user.enterpriseId);
        if (entErr) console.warn("Error updating enterprise in Supabase:", entErr);
      }
    }

    await refreshProfile();
    return null;
  };

  // Logout
  const logout = async () => {
    const s = getBrowserSupabaseClient();
    if (s) {
      await s.auth.signOut();
    }
    setUser(null);
    useEnterpriseStore.getState().reset();
    if (typeof window !== "undefined") {
      localStorage.removeItem("aarambh_enterprise_profile");
      localStorage.removeItem("aarambh_user");
    }
    router.push("/login");
  };

    return (
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          signIn,
          signInWithEmailOtp,
          signUpWithEmailOtp,
          resendSignupOtp,
          verifyEmailOtp,
          signUpApplicant,
          completeSignup,
          resetPassword,
          updatePassword,
          updateProfile,
          logout,
          refreshProfile,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth() {
    const c = useContext(AuthContext);

    if (!c) {
      throw new Error("useAuth must be used within an AuthProvider");
    }

    return c;
  }
