import * as React from "react";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?(checked: boolean): void;
  className?: string;
}

export function Switch({ checked, onCheckedChange, className = "" }: SwitchProps) {
  return (
    <input
      type="checkbox"
      className={`w-10 h-6 rounded bg-bg-elevated border border-[var(--border)] checked:bg-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ring-offset-2 ring-offset-[var(--bg-base)] ${className}`}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
}
