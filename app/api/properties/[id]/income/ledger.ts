import { randomUUID } from "crypto";

import { prisma } from "../../../../../lib/prisma";

export type IncomeRecord = {
  id: string;
  propertyId: string;
  tenantId?: string | null;
  date: string;
  category?: string | null;
  amount: number;
  notes?: string | null;
  label?: string | null;
  evidenceUrl?: string | null;
  evidenceName?: string | null;
};

const LEDGER_CATEGORY_ALIASES = [
  "base rent",
  "rent",
  "rent payment",
  "core rent",
  "arrears catch up",
  "arrears catchup",
];

const LEDGER_CATEGORY_SET = new Set(LEDGER_CATEGORY_ALIASES);

const normalizeCategory = (value?: string | null) =>
  value?.toLowerCase().replace(/[\-_]/g, " ").replace(/\s+/g, " ").trim() ?? "";

const shouldSyncToLedger = (category?: string | null) =>
  LEDGER_CATEGORY_SET.has(normalizeCategory(category));

const removeUndefined = <T extends Record<string, unknown>>(input: T) => {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      output[key] = value;
    }
  }
  return output as T;
};

const fetchLedgerEntries = async () => {
  const rows = await prisma.mockData.findMany({ where: { type: "rentLedger" } });
  return rows.map((row) => ({ id: row.id, data: row.data as any }));
};

const upsertLedgerEntry = async (
  income: IncomeRecord,
  previous?: IncomeRecord | null
) => {
  const ledgerEntries = await fetchLedgerEntries();
  let target = ledgerEntries.find(
    (entry) => entry.data?.sourceIncomeId === income.id
  );

  if (!target && previous) {
    target = ledgerEntries.find(
      (entry) => entry.data?.sourceIncomeId === previous.id
    );
  }

  if (!target) {
    target = ledgerEntries.find(
      (entry) =>
        entry.data?.propertyId === income.propertyId &&
        entry.data?.dueDate === income.date &&
        !entry.data?.sourceIncomeId
    );
  }

  const evidenceUrl = income.evidenceUrl ?? undefined;
  const evidenceName = income.evidenceName ?? undefined;
  const description = income.label ?? income.category ?? undefined;

  if (target) {
    const existing = target.data ?? {};
    const sameSource = existing.sourceIncomeId === income.id;
    const updated = { ...existing } as Record<string, any>;

    if (!sameSource) {
      updated.previousStatus = existing.status;
      updated.previousPaidDate = existing.paidDate;
      updated.previousAmount = existing.amount;
      updated.previousEvidenceUrl = existing.evidenceUrl;
      updated.previousEvidenceName = existing.evidenceName;
      updated.previousDescription = existing.description;
      updated.previousDueDate = existing.dueDate;
    }

    updated.propertyId = income.propertyId;
    if (income.tenantId !== undefined) {
      updated.tenantId = income.tenantId ?? undefined;
    }
    updated.amount = income.amount;
    updated.dueDate = income.date;
    updated.status = "paid";
    updated.paidDate = income.date;
    updated.sourceIncomeId = income.id;
    if (description) {
      updated.description = description;
    }
    if (evidenceUrl !== undefined) {
      updated.evidenceUrl = evidenceUrl;
    }
    if (evidenceName !== undefined) {
      updated.evidenceName = evidenceName;
    }

    const cleaned = removeUndefined(updated);
    await prisma.mockData.update({
      where: { id: target.id },
      data: { data: cleaned },
    });
    return;
  }

  const id = randomUUID();
  const newEntry = removeUndefined({
    id,
    propertyId: income.propertyId,
    tenantId: income.tenantId ?? undefined,
    amount: income.amount,
    dueDate: income.date,
    status: "paid",
    paidDate: income.date,
    sourceIncomeId: income.id,
    description: description ?? "Rent income",
    evidenceUrl,
    evidenceName,
  });

  await prisma.mockData.create({
    data: { id, type: "rentLedger", data: newEntry },
  });
};

const restoreLedgerEntry = async (income: IncomeRecord) => {
  const ledgerEntries = await fetchLedgerEntries();
  const match = ledgerEntries.find(
    (entry) => entry.data?.sourceIncomeId === income.id
  );
  if (!match) return;

  const data = match.data ?? {};
  if (
    Object.prototype.hasOwnProperty.call(data, "previousStatus") ||
    Object.prototype.hasOwnProperty.call(data, "previousPaidDate") ||
    Object.prototype.hasOwnProperty.call(data, "previousAmount") ||
    Object.prototype.hasOwnProperty.call(data, "previousEvidenceUrl") ||
    Object.prototype.hasOwnProperty.call(data, "previousEvidenceName") ||
    Object.prototype.hasOwnProperty.call(data, "previousDescription") ||
    Object.prototype.hasOwnProperty.call(data, "previousDueDate")
  ) {
    const restored = { ...data } as Record<string, any>;
    if (Object.prototype.hasOwnProperty.call(data, "previousStatus")) {
      restored.status = data.previousStatus;
    }
    if (Object.prototype.hasOwnProperty.call(data, "previousPaidDate")) {
      if (data.previousPaidDate) {
        restored.paidDate = data.previousPaidDate;
      } else {
        delete restored.paidDate;
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, "previousAmount")) {
      restored.amount = data.previousAmount;
    }
    if (Object.prototype.hasOwnProperty.call(data, "previousEvidenceUrl")) {
      if (data.previousEvidenceUrl) {
        restored.evidenceUrl = data.previousEvidenceUrl;
      } else {
        delete restored.evidenceUrl;
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, "previousEvidenceName")) {
      if (data.previousEvidenceName) {
        restored.evidenceName = data.previousEvidenceName;
      } else {
        delete restored.evidenceName;
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, "previousDescription")) {
      if (data.previousDescription) {
        restored.description = data.previousDescription;
      } else {
        delete restored.description;
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, "previousDueDate")) {
      restored.dueDate = data.previousDueDate;
    }

    delete restored.sourceIncomeId;
    delete restored.previousStatus;
    delete restored.previousPaidDate;
    delete restored.previousAmount;
    delete restored.previousEvidenceUrl;
    delete restored.previousEvidenceName;
    delete restored.previousDescription;
    delete restored.previousDueDate;

    const cleaned = removeUndefined(restored);
    await prisma.mockData.update({
      where: { id: match.id },
      data: { data: cleaned },
    });
    return;
  }

  await prisma.mockData.delete({ where: { id: match.id } });
};

export const syncLedgerForIncome = async (
  current: IncomeRecord,
  previous?: IncomeRecord | null
) => {
  const wasLedger = previous ? shouldSyncToLedger(previous.category) : false;
  const isLedger = shouldSyncToLedger(current.category);

  if (isLedger) {
    await upsertLedgerEntry(current, previous ?? null);
    return;
  }

  if (wasLedger) {
    await restoreLedgerEntry(previous!);
  }
};

export const removeLedgerForIncome = async (income: IncomeRecord) => {
  if (!shouldSyncToLedger(income.category)) {
    return;
  }
  await restoreLedgerEntry(income);
};

