"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  name: string;
  email: string;
  role: "applicant" | "officer";
  enterpriseId?: string;
  enterpriseName?: string;
  department?: string;
  isDigiLockerVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAsApplicant: (email: string, name?: string, enterpriseName?: string) => void;
  loginAsOfficer: (email: string, department?: string) => void;
  loginWithDigiLocker: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage if available
    try {
      const stored = localStorage.getItem("aarambh_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("aarambh_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("aarambh_user");
    }
  };

  const loginAsApplicant = (email: string, name = "Industrial Investor", enterpriseName = "Maharashtra Solvents & Chemicals Pvt Ltd") => {
    const applicantUser: User = {
      name,
      email,
      role: "applicant",
      enterpriseId: "ENT-MH-2026-8891",
      enterpriseName,
      isDigiLockerVerified: false,
    };
    saveUser(applicantUser);
    router.push("/dashboard");
  };

  const loginAsOfficer = (email: string, department = "MIDC Industrial Clearances") => {
    const officerUser: User = {
      name: "S. K. Kulkarni (Joint Director)",
      email,
      role: "officer",
      department,
    };
    saveUser(officerUser);
    router.push("/dashboard");
  };

  const loginWithDigiLocker = () => {
    // TODO: replace with real DigiLocker OAuth flow
    const digiUser: User = {
      name: "Rajeshwar Patil",
      email: "rajeshwar.patil@aarambhenterprise.in",
      role: "applicant",
      enterpriseId: "ENT-MH-DIGI-9921",
      enterpriseName: "Patil Agro & BioTech Industries",
      isDigiLockerVerified: true,
    };
    saveUser(digiUser);
    router.push("/dashboard");
  };

  const logout = () => {
    saveUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAsApplicant,
        loginAsOfficer,
        loginWithDigiLocker,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
