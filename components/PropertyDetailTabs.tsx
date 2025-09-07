"use client";

import { useState, useEffect } from "react";
import ExpensesTable from "./ExpensesTable";
import RentLedgerTable from "./RentLedgerTable";
import PropertyDocumentsTable from "./PropertyDocumentsTable";
import TenantCRM from "./TenantCRM";

interface Props {
  propertyId: string;
  events: { date: string; title: string }[];
}

const tabs = [
  { id: "rent-ledger", label: "Rent Ledger" },
  { id: "expenses", label: "Expenses" },
  { id: "documents", label: "Documents" },
  { id: "key-dates", label: "Key Dates" },
  { id: "tenant-crm", label: "Tenant CRM" },
] as const;

export default function PropertyDetailTabs({ propertyId, events }: Props) {
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
      {active === "key-dates" && (
        <ul className="space-y-1">
          {events.map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-sm text-gray-600">{e.date}</span>
              <span>{e.title}</span>
            </li>
          ))}
          {events.length === 0 && <li>No upcoming dates</li>}
        </ul>
      )}
      {active === "tenant-crm" && <TenantCRM propertyId={propertyId} />}
    </div>
  );
}

