import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgePercent,
  BookOpen,
  CalendarCheck,
  Compass,
  FileCheck2,
  FileSpreadsheet,
  FolderLock,
  GitMerge,
  Inbox,
  Landmark,
  LayoutDashboard,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
  Timer,
  TrendingDown,
  User,
} from "lucide-react";

export type RoleId = "APPLICANT" | "OFFICER" | "ADMIN";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  aliases?: string[];
  id?: string;
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export interface NavConfig {
  role: RoleId;
  sections: NavSection[];
}

export const APPLICANT_NAV_ITEMS: NavSection[] = [
  {
    heading: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "My Industrial Journey",
    items: [
      {
        label: "My Applications",
        href: "/dashboard/sla",
        icon: FileCheck2,
        aliases: ["/dashboard/sla-tracker", "/dashboard/prevalidation", "/dashboard/pre-validation"],
      },
      {
        label: "Approval Journey",
        href: "/dashboard/dag",
        icon: GitMerge,
        aliases: ["/dashboard/workflows"],
      },
      {
        label: "Deadlines & Alerts",
        href: "/dashboard/analytics",
        icon: AlertTriangle,
      },
      {
        label: "Joint Site Inspections",
        href: "/dashboard/inspections",
        icon: CalendarCheck,
      },
      {
        label: "Compliance & Renewals",
        href: "/dashboard/renewals",
        icon: ShieldCheck,
      },
    ],
  },
  {
    heading: "Application & Documents",
    items: [
      { label: "Track Approvals", href: "/dashboard/kya", icon: Compass },
      { label: "Start New Application", href: "/dashboard/caf", icon: FileSpreadsheet },
      { label: "Incentives & Benefits", href: "/dashboard/incentives", icon: BadgePercent },
      {
        label: "My Documents",
        href: "/dashboard/vault",
        icon: FolderLock,
        aliases: ["/dashboard/document-vault"],
      },
    ],
  },
  {
    heading: "Support & Account",
    items: [
      { label: "Help & Support", href: "/dashboard/grievances", icon: MessageSquareWarning },
      { label: "My Business Profile", href: "/dashboard/profile", icon: User },
    ],
  },
];

export const OFFICER_NAV_ITEMS: NavSection[] = [
  {
    heading: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Officer Review Console",
    items: [
      { label: "Scrutiny Work Queue", href: "/dashboard/officer-workspace", icon: Inbox },
      {
        label: "SLA & RTS SLA Tracker",
        href: "/dashboard/sla",
        icon: Timer,
        aliases: ["/dashboard/sla-tracker"],
      },
      { label: "Inspection Scheduler", href: "/dashboard/inspections", icon: MapPin },
      { label: "Policy & Gazette Search", href: "/dashboard/kya", icon: BookOpen },
      {
        label: "Approval Roadmap (DAG)",
        href: "/dashboard/dag",
        icon: GitMerge,
        aliases: ["/dashboard/workflows"],
      },
    ],
  },
  {
    heading: "Verification & Documents",
    items: [
      { label: "Application Form", href: "/dashboard/caf", icon: FileSpreadsheet },
      {
        label: "Document Vault",
        href: "/dashboard/vault",
        icon: FolderLock,
        aliases: ["/dashboard/document-vault"],
      },
      {
        label: "Pre-Validation Gate",
        href: "/dashboard/prevalidation",
        icon: FileCheck2,
        aliases: ["/dashboard/pre-validation"],
      },
    ],
  },
  {
    heading: "Approvals & Monitoring",
    items: [
      { label: "Workflow Delay Monitor", href: "/dashboard/analytics", icon: TrendingDown },
      { label: "Department View", href: "/dashboard/department-approvals", icon: Landmark },
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

export const ADMIN_NAV_ITEMS: NavSection[] = [
  {
    heading: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Admin Governance",
    items: [
      { label: "Scrutiny Work Queue", href: "/dashboard/officer-workspace", icon: Inbox },
      {
        label: "SLA & RTS SLA Tracker",
        href: "/dashboard/sla",
        icon: Timer,
        aliases: ["/dashboard/sla-tracker"],
      },
      { label: "Inspection Scheduler", href: "/dashboard/inspections", icon: MapPin },
      { label: "Policy & Gazette Search", href: "/dashboard/kya", icon: BookOpen },
      {
        label: "Approval Roadmap (DAG)",
        href: "/dashboard/dag",
        icon: GitMerge,
        aliases: ["/dashboard/workflows"],
      },
      { label: "Department View", href: "/dashboard/department-approvals", icon: Landmark },
      {
        label: "Document Vault",
        href: "/dashboard/vault",
        icon: FolderLock,
        aliases: ["/dashboard/document-vault"],
      },
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

export const NAV_BY_ROLE: Record<RoleId, NavSection[]> = {
  APPLICANT: APPLICANT_NAV_ITEMS,
  OFFICER: OFFICER_NAV_ITEMS,
  ADMIN: ADMIN_NAV_ITEMS,
};

export const NAV_CONFIG: NavConfig[] = [
  { role: "APPLICANT", sections: APPLICANT_NAV_ITEMS },
  { role: "OFFICER", sections: OFFICER_NAV_ITEMS },
  { role: "ADMIN", sections: ADMIN_NAV_ITEMS },
];

export const OFFICER_ONLY_ROUTES: string[] = [
  "/dashboard/officer-workspace",
  "/dashboard/department-approvals",
];