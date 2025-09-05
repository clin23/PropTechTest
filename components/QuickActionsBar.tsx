"use client";

interface Props {
  onLogExpense?: () => void;
  onUploadDocument?: () => void;
  onMessageTenant?: () => void;
}

export default function QuickActionsBar({
  onLogExpense,
  onUploadDocument,
  onMessageTenant,
}: Props) {
  return (
    <div className="flex gap-2">
      <button
        className="px-2 py-1 bg-blue-500 text-white"
        onClick={onLogExpense}
      >
        Log Expense
      </button>
      <button
        className="px-2 py-1 bg-green-500 text-white"
        onClick={onUploadDocument}
      >
        Upload Document
      </button>
      <button
        className="px-2 py-1 bg-purple-500 text-white"
        onClick={onMessageTenant}
      >
        Message Tenant
      </button>
    </div>
  );
}
