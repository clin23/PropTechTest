"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import QuickActionsBar from "../../../components/QuickActionsBar";
import ExpenseForm from "../../../components/ExpenseForm";
import DocumentUploadModal from "../../../components/DocumentUploadModal";
import MessageTenantModal from "../../../components/MessageTenantModal";

export default function PropertyPage() {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6 space-y-4">
      <QuickActionsBar
        onLogExpense={() => setExpenseOpen(true)}
        onUploadDocument={() => setDocOpen(true)}
        onMessageTenant={() => setMessageOpen(true)}
      />
      <ExpenseForm
        propertyId={id}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        showTrigger={false}
      />
      <DocumentUploadModal open={docOpen} onClose={() => setDocOpen(false)} />
      <MessageTenantModal open={messageOpen} onClose={() => setMessageOpen(false)} />
      <div>Property Details</div>
    </div>
  );
}
