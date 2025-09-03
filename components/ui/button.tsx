import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={"px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50 " + className}
      {...props}
    />
  );
}
