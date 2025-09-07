"use client";

import { useState } from "react";
import ExpensesTable from "./ExpensesTable";
import RentLedgerTable from "./RentLedgerTable";
import PropertyDocumentsTable from "./PropertyDocumentsTable";

interface Props {
  propertyId: string;
  events: { date: string; title: string }[];
}

const tabs = ["Rent Ledger", "Expenses", "Documents", "Key Dates"] as const;

export default function PropertyDetailTabs({ propertyId, events }: Props) {
  const [active, setActive] = useState<typeof tabs[number]>("Rent Ledger");

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            className={`pb-2 ${
              active === t ? "border-b-2 border-blue-500 font-semibold" : ""
            }`}
            onClick={() => setActive(t)}
            role="tab"
          >
            {t}
          </button>
        ))}
      </div>
      {active === "Rent Ledger" && <RentLedgerTable propertyId={propertyId} />}
      {active === "Expenses" && <ExpensesTable propertyId={propertyId} />}
      {active === "Documents" && <PropertyDocumentsTable propertyId={propertyId} />}
      {active === "Key Dates" && (
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
    </div>
  );
}

