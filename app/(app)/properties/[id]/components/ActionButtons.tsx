"use client";

import type { ButtonHTMLAttributes } from "react";
import { Button } from "../../../../../components/ui/button";

interface ActionButtonsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onUploadDocument: () => void;
}

function ActionButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      className={`whitespace-nowrap px-3 py-1 text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

export default function ActionButtons({
  onAddIncome,
  onAddExpense,
  onUploadDocument,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton
        onClick={onAddIncome}
        aria-label="Add Income"
        className="bg-green-600 text-white hover:bg-green-700"
      >
        +Add Income
      </ActionButton>
      <ActionButton
        onClick={onAddExpense}
        aria-label="Add Expense"
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        +Add Expense
      </ActionButton>
      <ActionButton
        onClick={onUploadDocument}
        aria-label="Upload Document"
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        +Upload Document
      </ActionButton>
    </div>
  );
}
