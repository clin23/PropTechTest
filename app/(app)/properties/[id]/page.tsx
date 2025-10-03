"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import IncomeForm from "../../../../components/IncomeForm";
import ExpenseForm from "../../../../components/ExpenseForm";
import DocumentUploadModal from "../../../../components/DocumentUploadModal";
import { getProperty, listProperties } from "../../../../lib/api";
import type { PropertySummary } from "../../../../types/property";
import { useURLState } from "../../../../lib/useURLState";
import PropertyHero from "./components/PropertyHero";
import PropertyEditModal from "../../../../components/PropertyEditModal";
import ScrollableSectionBar from "./components/ScrollableSectionBar";
import RentLedger from "./sections/RentLedger";
import Expenses from "./sections/Expenses";
import OtherIncome from "./sections/OtherIncome";
import Documents from "./sections/Documents";
import RentReview from "./sections/RentReview";
import KeyDates from "./sections/KeyDates";
import TasksSection from "./sections/Tasks";
import Inspections from "./sections/Inspections";
import CreateListing from "./sections/CreateListing";
import Vendors from "./sections/Vendors";
import PropertyPageSkeleton from "../../../../components/skeletons/PropertyPageSkeleton";
import { recordRecentProperty } from "../../../../lib/recentItems";
import {
  DEFAULT_PROPERTY_TAB,
  PROPERTY_TABS,
  type PropertyTabId,
} from "./tabs";
export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useURLState<PropertyTabId>({
    key: "tab",
    defaultValue: DEFAULT_PROPERTY_TAB,
  });
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const hasValidId = typeof id === "string" && id.length > 0;

  const { data: property, isPending, isError } = useQuery<PropertySummary>({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
    enabled: hasValidId,
  });

  useEffect(() => {
    setIsRedirecting(false);
  }, [id]);

  const cachedProperties = queryClient.getQueryData<PropertySummary[]>(["properties"]);
  const { data: fetchedProperties } = useQuery<PropertySummary[]>({
    queryKey: ["properties"],
    queryFn: listProperties,
    enabled: isError && !cachedProperties,
    staleTime: 5 * 60 * 1000,
  });

  const availableProperties = useMemo(
    () => cachedProperties ?? fetchedProperties ?? [],
    [cachedProperties, fetchedProperties],
  );

  useEffect(() => {
    if (!isError || !availableProperties.length || !hasValidId) {
      return;
    }

    const fallback =
      availableProperties.find((item) => item.id !== id) ?? availableProperties[0];

    if (!fallback || fallback.id === id) {
      return;
    }

    setIsRedirecting(true);
    router.replace(`/properties/${fallback.id}`);
  }, [availableProperties, hasValidId, id, isError, router]);

  const resolvedTab = useMemo<PropertyTabId>(() => {
    return PROPERTY_TABS.some((tab) => tab.id === activeTab)
      ? activeTab
      : DEFAULT_PROPERTY_TAB;
  }, [activeTab]);

  if (isError && !isRedirecting) {
    return <div className="p-6">Failed to load property</div>;
  }

  if (!property && !isPending && !isRedirecting) {
    return <div className="p-6">Failed to load property</div>;
  }

  const ready = Boolean(property);

  const handleTabSelect = (tab: string) => {
    const match = PROPERTY_TABS.find((item) => item.id === tab);
    if (match) {
      setActiveTab(match.id);
    }
  };

  const handleNavigateToTab = (tabId: PropertyTabId) => {
    setActiveTab(tabId);
  };

  const renderSection = (tabId: PropertyTabId) => {
    if (!property) return null;
    switch (tabId) {
      case "rent-ledger":
        return <RentLedger propertyId={id} />;
      case "expenses":
        return <Expenses propertyId={id} />;
      case "other-income":
        return <OtherIncome propertyId={id} />;
      case "documents":
        return <Documents propertyId={id} />;
      case "tasks":
        return <TasksSection propertyId={id} propertyAddress={property.address} />;
      case "rent-review":
        return <RentReview propertyId={id} />;
      case "key-dates":
        return <KeyDates propertyId={id} />;
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
    <div className="relative">
      {!ready && (
        <div className="p-6">
          <PropertyPageSkeleton />
        </div>
      )}
      {property && (
        <div className="p-6">
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
              <div>
                <PropertyHero
                  property={property}
                  onAddIncome={() => setIncomeOpen(true)}
                  onAddExpense={() => setExpenseOpen(true)}
                  onUploadDocument={() => setDocumentOpen(true)}
                  onNavigateToTab={handleNavigateToTab}
                  onEditProperty={() => setEditOpen(true)}
                />
              </div>
              <div>
                <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex-shrink-0 border-b border-gray-100 px-4 pb-1 pt-4 sm:px-6 dark:border-gray-800">
                    <ScrollableSectionBar
                      tabs={PROPERTY_TABS}
                      activeTab={resolvedTab}
                      onTabSelect={handleTabSelect}
                      variant="contained"
                      className="pt-3 pb-2 sm:pt-4 sm:pb-3"
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
            </section>
            <IncomeForm propertyId={id} open={incomeOpen} onOpenChange={setIncomeOpen} showTrigger={false} />
            <ExpenseForm propertyId={id} open={expenseOpen} onOpenChange={setExpenseOpen} showTrigger={false} />
            <DocumentUploadModal propertyId={id} open={documentOpen} onClose={() => setDocumentOpen(false)} />
            <PropertyEditModal
              property={property}
              open={editOpen}
              onClose={() => setEditOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
