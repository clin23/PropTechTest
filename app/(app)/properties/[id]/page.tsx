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
  const [moreOpen, setMoreOpen] = useState(false);
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
      </button>
      <div className="relative inline-block">
        <button
          className="px-2 py-1 border rounded dark:border-gray-700"
          onClick={() => setMoreOpen((o) => !o)}
        >
          More...
        </button>
        {moreOpen && (
          <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow">
            <Link
              href={`/properties/${id}/inspections`}
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Inspections
            </Link>
            {property.tenant === "" && (
              <Link
                href={`/properties/${id}/applications`}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Applications
              </Link>
            )}
            <Link
              href={`/properties/${id}/listing`}
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Create Listing
            </Link>
            <Link
              href="/vendors"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Vendors
            </Link>
          </div>
        )}
      </div>
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
