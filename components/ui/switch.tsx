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
      className={"w-10 h-6 " + className}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
}
