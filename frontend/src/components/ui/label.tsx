import React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={`text-xs font-semibold text-slate-700 select-none ${className}`}
      {...props}
    />
  );
}
