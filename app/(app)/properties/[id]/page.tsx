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
import PropertyHero from "./components/PropertyHero";
import ScrollableSectionBar, { type SectionTab } from "./components/ScrollableSectionBar";
import RentLedger from "./sections/RentLedger";
import Expenses from "./sections/Expenses";
import Documents from "./sections/Documents";
import RentReview from "./sections/RentReview";
import KeyDates from "./sections/KeyDates";
import TasksSection from "./sections/Tasks";
import TenantCRM from "./sections/TenantCRM";
import Inspections from "./sections/Inspections";
import CreateListing from "./sections/CreateListing";
import Vendors from "./sections/Vendors";

const TABS = [
  { id: "rent-ledger", label: "Rent Ledger" },
  { id: "expenses", label: "Expenses" },
  { id: "documents", label: "Documents" },
  { id: "tasks", label: "Tasks" },
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
      case "tasks":
        return (
          <TasksSection
            propertyId={id}
            propertyAddress={property.address}
          />
        );
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
    <div className="space-y-6 p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] xl:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <PropertyHero
            property={property}
            onEdit={() => setEditOpen(true)}
            onAddIncome={() => setIncomeOpen(true)}
            onAddExpense={() => setExpenseOpen(true)}
            onUploadDocument={() => setDocumentOpen(true)}
          />
        </div>
        <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex-shrink-0 border-b border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800">
            <ScrollableSectionBar
              tabs={TABS}
              activeTab={resolvedTab}
              onTabSelect={handleTabSelect}
              variant="contained"
            />
          </div>
          <div
            role="tabpanel"
            id={`panel-${resolvedTab}`}
            aria-labelledby={`tab-${resolvedTab}`}
            tabIndex={0}
            className="flex-1 overflow-auto px-4 pb-6 pt-4 sm:px-6"
          >
            {renderSection(resolvedTab)}
          </div>
        </section>
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
