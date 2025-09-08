"use client";

interface QuickActionsBarProps {
  onLogExpense?: () => void;
  onUploadDocument?: () => void;
  onMessageTenant?: () => void;
}

export default function QuickActionsBar({
  onLogExpense,
  onUploadDocument,
  onMessageTenant,
}: QuickActionsBarProps) {
  return (
    <div className="flex gap-2">
      <button
        className="px-2 py-1 bg-blue-500 text-white rounded"
        onClick={onLogExpense}
      >
        +Expense
      </button>
      <button
        className="px-2 py-1 bg-green-500 text-white rounded"
        onClick={onUploadDocument}
      >
        +Upload Doc
      </button>
      <button
        className="px-2 py-1 bg-purple-500 text-white rounded"
        onClick={onMessageTenant}
      >
        +Tenant Note
      </button>
    </div>
  );
}
