"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import QuickActionsBar from "../../../../components/QuickActionsBar";
import ExpenseForm from "../../../../components/ExpenseForm";
import DocumentUploadModal from "../../../../components/DocumentUploadModal";
import MessageTenantModal from "../../../../components/MessageTenantModal";
import PropertyOverviewCard from "../../../../components/PropertyOverviewCard";
import PropertyDetailTabs from "../../../../components/PropertyDetailTabs";
import PropertyEditModal from "../../../../components/PropertyEditModal";
import { getProperty } from "../../../../lib/api";
import type { PropertySummary } from "../../../../types/property";

export default function PropertyPage() {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { id } = useParams<{ id: string }>();

  const { data: property } = useQuery<PropertySummary>({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
  });

  if (!property) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <QuickActionsBar
        onLogExpense={() => setExpenseOpen(true)}
        onUploadDocument={() => setDocOpen(true)}
        onMessageTenant={() => setMessageOpen(true)}
      />
      <Link
        href={`/properties/${id}/edit`}
        className="inline-block px-2 py-1 border rounded dark:border-gray-700"
      >
        Edit Property
      </Link>
      <ExpenseForm
        propertyId={id}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        showTrigger={false}
      />
      <DocumentUploadModal
        propertyId={id}
        open={docOpen}
        onClose={() => setDocOpen(false)}
      />
      <MessageTenantModal open={messageOpen} onClose={() => setMessageOpen(false)} />
      <PropertyEditModal
        property={property}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <h1 className="text-2xl font-semibold">Property Details</h1>
      <PropertyOverviewCard property={property} />
      <PropertyDetailTabs propertyId={id} />
    </div>
  );
}
