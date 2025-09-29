import type { SectionTab } from "./components/ScrollableSectionBar";

export const PROPERTY_TABS = [
  { id: "rent-ledger", label: "Rent Ledger" },
  { id: "expenses", label: "Expenses" },
  { id: "other-income", label: "Other Income" },
  { id: "documents", label: "Documents" },
  { id: "tasks", label: "Tasks" },
  { id: "rent-review", label: "Rent Review" },
  { id: "key-dates", label: "Key Dates" },
  { id: "tenant-crm", label: "Tenant CRM" },
  { id: "inspections", label: "Inspections" },
  { id: "create-listing", label: "Create Listing" },
  { id: "vendors", label: "Vendors" },
] as const satisfies SectionTab[];

export type PropertyTabId = (typeof PROPERTY_TABS)[number]["id"];

export const DEFAULT_PROPERTY_TAB: PropertyTabId = "rent-ledger";
