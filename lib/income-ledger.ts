export const RENT_LEDGER_CATEGORY_NAMES = [
  "Base rent",
  "Rent",
  "Rent payment",
  "Core rent",
  "Arrears catch-up",
  "Arrears catchup",
  "Arrears catch up",
] as const;

export const RENT_LEDGER_CATEGORY_GROUP = "CoreRent" as const;

export const RENT_LEDGER_DEFAULT_CATEGORY = "Base rent" as const;

const normalizeCategory = (value: string) =>
  value.toLowerCase().replace(/[\-_]/g, " ").replace(/\s+/g, " ").trim();

const RENT_LEDGER_CATEGORY_SET = new Set(
  RENT_LEDGER_CATEGORY_NAMES.map((value) => normalizeCategory(value))
);

export const isRentLedgerCategory = (value?: string | null) => {
  if (!value) return false;
  return RENT_LEDGER_CATEGORY_SET.has(normalizeCategory(value));
};
