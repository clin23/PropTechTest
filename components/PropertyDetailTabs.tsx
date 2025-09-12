"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ExpensesTable from "./ExpensesTable";
import RentLedgerTable from "./RentLedgerTable";
import PropertyDocumentsTable from "./PropertyDocumentsTable";
import PropertyRentReview from "./PropertyRentReview";
import TenantCRM from "./TenantCRM";
import UpcomingReminders from "./UpcomingReminders";

interface Props {
  propertyId: string;
}

const tabs = [
  { id: "rent-ledger", label: "Rent Ledger" },
  { id: "expenses", label: "Expenses" },
  { id: "documents", label: "Documents" },
  { id: "rent-review", label: "Rent Review" },
  { id: "key-dates", label: "Key Dates" },
  { id: "tenant-crm", label: "Tenant CRM" },
] as const;

export default function PropertyDetailTabs({ propertyId }: Props) {
  const [active, setActive] = useState<string>(tabs[0].id);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActive(hash);
    }
    const onHash = () => setActive(window.location.hash.slice(1) || tabs[0].id);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`pb-2 ${
              active === t.id
                ? "border-b-2 border-blue-500 font-semibold text-blue-600 dark:text-blue-400"
                : ""
            }`}
            onClick={() => {
              window.location.hash = t.id;
              setActive(t.id);
            }}
            role="tab"
          >
            {t.label}
          </button>
        ))}
        <Link
          href={`/properties/${propertyId}/inspections`}
          className="pb-2"
          role="tab"
        >
          Inspections
        </Link>
        <Link
          href={`/properties/${propertyId}/listing`}
          className="pb-2"
          role="tab"
        >
          Create Listing
        </Link>
        <Link href="/vendors" className="pb-2" role="tab">
          Vendors
        </Link>
      </div>
      {active === "rent-ledger" && <RentLedgerTable propertyId={propertyId} />}
      {active === "expenses" && <ExpensesTable propertyId={propertyId} />}
      {active === "documents" && <PropertyDocumentsTable propertyId={propertyId} />}
      {active === "rent-review" && <PropertyRentReview propertyId={propertyId} />}
      {active === "key-dates" && <UpcomingReminders propertyId={propertyId} />}
      {active === "tenant-crm" && <TenantCRM propertyId={propertyId} />}
    </div>
  );
}

