"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import IncomeForm from "../../../../components/IncomeForm";
import ExpenseForm from "../../../../components/ExpenseForm";
import DocumentUploadModal from "../../../../components/DocumentUploadModal";
import PropertyEditModal from "../../../../components/PropertyEditModal";
import { getProperty } from "../../../../lib/api";
import type { PropertySummary } from "../../../../types/property";
import { useURLState } from "../../../../lib/useURLState";
import ActionButtons from "./components/ActionButtons";
import PropertyHero from "./components/PropertyHero";
import ScrollableSectionBar, { type SectionTab } from "./components/ScrollableSectionBar";
import RentLedger from "./sections/RentLedger";
import Expenses from "./sections/Expenses";
import Documents from "./sections/Documents";
import RentReview from "./sections/RentReview";
import KeyDates from "./sections/KeyDates";
import TenantCRM from "./sections/TenantCRM";
import Inspections from "./sections/Inspections";
import CreateListing from "./sections/CreateListing";
import Vendors from "./sections/Vendors";

const TABS = [
  { id: "rent-ledger", label: "Rent Ledger" },
  { id: "expenses", label: "Expenses" },
  { id: "documents", label: "Documents" },
  { id: "rent-review", label: "Rent Review" },
  { id: "key-dates", label: "Key Dates" },
  { id: "tenant-crm", label: "Tenant CRM" },
  { id: "inspections", label: "Inspections" },
  { id: "create-listing", label: "Create Listing" },
  { id: "vendors", label: "Vendors" },
] as const satisfies SectionTab[];

type TabId = (typeof TABS)[number]["id"];
const DEFAULT_TAB: TabId = "rent-ledger";

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useURLState<TabId>({
    key: "tab",
    defaultValue: DEFAULT_TAB,
  });
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: property, isPending } = useQuery<PropertySummary>({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
  });

  const resolvedTab = useMemo<TabId>(() => {
    return TABS.some((tab) => tab.id === activeTab) ? activeTab : DEFAULT_TAB;
  }, [activeTab]);

  if (isPending || !property) {
    return <div className="p-6">Loading...</div>;
  }

  const handleTabSelect = (tab: string) => {
    const match = TABS.find((item) => item.id === tab);
    if (match) {
      setActiveTab(match.id);
    }
  };

  const renderSection = (tabId: TabId) => {
    switch (tabId) {
      case "rent-ledger":
        return <RentLedger propertyId={id} />;
      case "expenses":
        return <Expenses propertyId={id} />;
      case "documents":
        return <Documents propertyId={id} />;
      case "rent-review":
        return <RentReview propertyId={id} />;
      case "key-dates":
        return <KeyDates propertyId={id} />;
      case "tenant-crm":
        return <TenantCRM propertyId={id} />;
      case "inspections":
        return <Inspections propertyId={id} />;
      case "create-listing":
        return <CreateListing property={property} />;
      case "vendors":
        return <Vendors propertyId={id} />;
      default:
        return <RentLedger propertyId={id} />;
    }
  };

  return (
    <div className="space-y-4 p-6">
      <ActionButtons
        onAddIncome={() => setIncomeOpen(true)}
        onAddExpense={() => setExpenseOpen(true)}
        onUploadDocument={() => setDocumentOpen(true)}
      />
      <PropertyHero property={property} onEdit={() => setEditOpen(true)} />
      <ScrollableSectionBar
        tabs={TABS}
        activeTab={resolvedTab}
        onTabSelect={handleTabSelect}
      />
      <div
        role="tabpanel"
        id={`panel-${resolvedTab}`}
        aria-labelledby={`tab-${resolvedTab}`}
        tabIndex={0}
        className="pt-2"
      >
        {renderSection(resolvedTab)}
      </div>
      <IncomeForm
        propertyId={id}
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
        showTrigger={false}
      />
      <ExpenseForm
        propertyId={id}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        showTrigger={false}
      />
      <DocumentUploadModal
        propertyId={id}
        open={documentOpen}
        onClose={() => setDocumentOpen(false)}
      />
      <PropertyEditModal
        property={property}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
