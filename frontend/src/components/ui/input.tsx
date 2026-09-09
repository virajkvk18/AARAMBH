import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FE7251] focus:ring-1 focus:ring-[#FE7251] disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
