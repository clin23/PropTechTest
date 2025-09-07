// Parent → child structure for UI grouping
export const EXPENSE_CATEGORIES = {
  FinanceHolding: [
    "Mortgage interest","Loan fees","Bank charges"
  ],
  RatesUtilitiesStrata: [
    "Council rates","Water rates","Strata – admin fund","Strata – sinking fund",
    "Electricity","Gas","Internet/phone"
  ],
  Insurance: [
    "Landlord insurance","Building insurance","Contents (landlord)"
  ],
  MaintenanceRepairs: [
    "General repairs","Plumbing","Electrical","Appliance service/repair",
    "Gardening & landscaping","Pest control","Rubbish removal","Security"
  ],
  CleaningTurnover: [
    "End-of-lease clean","Carpet/steam clean","Advertising & marketing","Letting fee"
  ],
  ComplianceSafety: [
    "Smoke alarm service","Electrical safety check","Gas safety check","Pool safety certificate"
  ],
  ProfessionalAdmin: [
    "Property management fees","Accounting & bookkeeping","Legal fees","Postage/printing/stationery"
  ],
  CapitalDepreciation: [
    "Capital improvements","Depreciation – fixtures & fittings","Building depreciation"
  ],
  Other: ["Miscellaneous"]
} as const;

export const INCOME_CATEGORIES = {
  CoreRent: ["Base rent","Arrears catch-up"],
  Reimbursements: ["Utilities reimbursement","Repairs reimbursement"],
  FeesExtras: ["Break lease / reletting fee","Late fee","Parking space rent","Storage/garage rent","Short-stay cleaning/host fee"],
  InsuranceGovt: ["Insurance payout – rent default","Insurance payout – damage","Government grant/subsidy"],
  Other: ["Miscellaneous income"]
} as const;

// Flattened arrays for selects
export const EXPENSE_CATEGORY_OPTIONS = Object.values(EXPENSE_CATEGORIES).flat();
export const INCOME_CATEGORY_OPTIONS  = Object.values(INCOME_CATEGORIES).flat();
