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
  phone?: string;
  panNumber?: string;
  entityType?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  district?: string;
  state?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAsApplicant: (
    email: string,
    name?: string,
    enterpriseName?: string,
    extra?: Partial<User>
  ) => void;
  loginAsOfficer: (email: string, department?: string) => void;
  loginWithDigiLocker: () => void;
  toggleRole: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage if available, or initialize default demo applicant
    try {
      const stored = localStorage.getItem("aarambh_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        const defaultUser: User = {
          name: "Sanjay Deshmukh",
          email: "investor@smartelectronics.in",
          role: "applicant",
          enterpriseId: "ENT-MH-2026-8891",
          enterpriseName: "Maharashtra Solvents & Chemicals Pvt Ltd",
          phone: "9823012345",
          panNumber: "AAECS8891M",
          entityType: "proprietor",
          addressLine1: "Plot No. A-42, Sector 10",
          addressLine2: "MIDC Chakan Phase-II",
          pinCode: "410501",
          district: "Pune",
          state: "Maharashtra",
          isDigiLockerVerified: false,
        };
        setUser(defaultUser);
        localStorage.setItem("aarambh_user", JSON.stringify(defaultUser));
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

  const loginAsApplicant = (
    email: string,
    name = "Sanjay Deshmukh",
    enterpriseName = "Maharashtra Solvents & Chemicals Pvt Ltd",
    extra: Partial<User> = {}
  ) => {
    const applicantUser: User = {
      name,
      email,
      role: "applicant",
      enterpriseId: extra.enterpriseId || "ENT-MH-2026-8891",
      enterpriseName,
      phone: extra.phone || "9823012345",
      panNumber: extra.panNumber || "AAECS8891M",
      entityType: extra.entityType || "proprietor",
      addressLine1: extra.addressLine1 || "Plot No. A-42, Sector 10",
      addressLine2: extra.addressLine2 || "MIDC Chakan Phase-II",
      pinCode: extra.pinCode || "410501",
      district: extra.district || "Pune",
      state: extra.state || "Maharashtra",
      isDigiLockerVerified: extra.isDigiLockerVerified || false,
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
    router.push("/dashboard/officer-workspace");
  };

  const loginWithDigiLocker = () => {
    const digiUser: User = {
      name: "Rajeshwar Patil",
      email: "rajeshwar.patil@aarambhenterprise.in",
      role: "applicant",
      enterpriseId: "ENT-MH-DIGI-9921",
      enterpriseName: "Patil Agro & BioTech Industries",
      phone: "9822019921",
      panNumber: "AABCP4412K",
      entityType: "company",
      addressLine1: "Industrial Cluster B-12",
      addressLine2: "Butibori MIDC, Nagpur",
      pinCode: "441108",
      district: "Nagpur",
      state: "Maharashtra",
      isDigiLockerVerified: true,
    };
    saveUser(digiUser);
    router.push("/dashboard");
  };

  const toggleRole = () => {
    if (user?.role === "officer") {
      loginAsApplicant("investor@smartelectronics.in", "Sanjay Deshmukh", "Maharashtra Solvents & Chemicals Pvt Ltd");
    } else {
      loginAsOfficer("officer.midc@maharashtra.gov.in", "MIDC Industrial Clearances");
    }
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
        toggleRole,
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

