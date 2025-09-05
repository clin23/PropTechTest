import type { ExpenseRow } from "../types/expense";

export function exportCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
    ["Date", "Category", "Vendor", "Amount", "GST", "Notes"],
    ...expenses.map((e) => [
      e.date,
      e.category,
      e.vendor,
      e.amount.toString(),
      e.gst.toString(),
      e.notes ?? "",
    ]),
  ];
  exportCSV(filename, rows);
}

export function exportExpensesPDF(
  filename: string,
  expenses: ExpenseRow[],
) {
  const rows = expenses
    .map(
      (e) =>
        `<tr><td>${e.date}</td><td>${e.category}</td><td>${e.vendor}</td><td>${e.amount}</td><td>${e.gst}</td><td>${e.notes ?? ""}</td></tr>`,
    )
    .join("");
  const html = `<table border='1'><tr><th>Date</th><th>Category</th><th>Vendor</th><th>Amount</th><th>GST</th><th>Notes</th></tr>${rows}</table>`;
  exportPDF(filename, html);
}
