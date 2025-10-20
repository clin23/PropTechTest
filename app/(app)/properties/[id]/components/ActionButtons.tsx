"use client";

import type { ButtonHTMLAttributes } from "react";
import { Button } from "../../../../../components/ui/button";

interface ActionButtonsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onUploadDocument: () => void;
  onEditProperty?: () => void;
}

function ActionButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      className={`h-9 w-full whitespace-nowrap rounded-md px-3 text-xs font-semibold sm:flex-1 sm:px-2 sm:text-xs ${className}`}
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
  onEditProperty,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <ActionButton
        onClick={onAddIncome}
        aria-label="Add Income"
        className="bg-green-600 text-white hover:bg-green-700"
      >
        Add Income
      </ActionButton>
      <ActionButton
        onClick={onAddExpense}
        aria-label="Add Expense"
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Add Expense
      </ActionButton>
      <ActionButton
        onClick={onUploadDocument}
        aria-label="Upload Document"
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        Upload Document
      </ActionButton>
      {onEditProperty && (
        <ActionButton
          onClick={onEditProperty}
          aria-label="Edit Property"
          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          Edit Property
        </ActionButton>
      )}
    </div>
  );
}
