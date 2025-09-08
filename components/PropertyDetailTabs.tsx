"use client";

import { useState, useEffect } from "react";
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
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`pb-2 ${
              active === t.id ? "border-b-2 border-blue-500 font-semibold" : ""
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

