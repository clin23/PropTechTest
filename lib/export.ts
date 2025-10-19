import type { ExpenseRow } from "../types/expense";
import { logEvent } from "./log";
import { EXPENSE_CATEGORIES } from "./categories";

export function toCSV(rows: string[][]) {
  return rows
    .map((r) =>
      r
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}

export function exportCSV(filename: string, rows: string[][]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  logEvent("export_csv", { filename });
}

export function exportPDF(filename: string, html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.print();
  win.close();
}

export function exportExpensesCSV(
  filename: string,
  expenses: ExpenseRow[],
) {
  const rows: string[][] = [
    ["Date", "Parent Group", "Category", "Vendor", "Amount", "GST", "Notes"],
    ...expenses.map((e) => [
      e.date,
      categoryParent(e.category),
      e.category,
      e.vendor,
      e.amount.toString(),
      e.gst.toString(),
      e.notes ?? "",
    ]),
  ];
  logEvent("export_expenses_csv", { count: expenses.length });
  exportCSV(filename, rows);
}

export function exportExpensesPDF(
  filename: string,
  expenses: ExpenseRow[],
) {
  const rows = expenses
    .map(
      (e) =>
        `<tr><td>${e.date}</td><td>${categoryParent(e.category)}</td><td>${e.category}</td><td>${e.vendor}</td><td>${e.amount}</td><td>${e.gst}</td><td>${e.notes ?? ""}</td></tr>`,
    )
    .join("");
  const html = `<table border='1'><tr><th>Date</th><th>Parent Group</th><th>Category</th><th>Vendor</th><th>Amount</th><th>GST</th><th>Notes</th></tr>${rows}</table>`;
  logEvent("export_expenses_pdf", { count: expenses.length });
  exportPDF(filename, html);
}

const expenseCategoryParentLookup = Object.entries(EXPENSE_CATEGORIES).reduce(
  (lookup, [parent, categories]) => {
    for (const category of categories) {
      lookup[category] = parent;
    }
    return lookup;
  },
  {} as Record<string, string>,
);

export function categoryParent(cat: string): string {
  return expenseCategoryParentLookup[cat] ?? "Other";
}
