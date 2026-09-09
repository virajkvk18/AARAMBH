import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info";
}

const badgeVariants = {
  default: "bg-[#FE7251] text-white",
  secondary: "bg-slate-100 text-slate-800 border border-slate-200",
  outline: "border border-slate-300 text-slate-700 bg-transparent",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  destructive: "bg-rose-50 text-rose-700 border border-rose-200",
  info: "bg-sky-50 text-sky-700 border border-sky-200",
};

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${badgeVariants[variant]} ${className}`}
      {...props}
    />
  );
}
