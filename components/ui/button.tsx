import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive";
}

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const base =
    "px-3 py-1 rounded disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ring-offset-2 ring-offset-[var(--bg-base)] transition-colors";
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white",
    secondary:
      "bg-[var(--bg-surface)] border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text-secondary)]",
    destructive: "bg-[var(--danger)] hover:brightness-110 text-white",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
