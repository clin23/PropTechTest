import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`bg-bg-surface border border-[var(--border)] rounded px-2 py-1 w-full text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ring-offset-2 ring-offset-[var(--bg-base)] ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
