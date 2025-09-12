import { useState } from 'react';

interface IncomeItem {
  amount: number;
  property?: string;
}

interface ExpenseItem {
  amount: number;
  vendor: string;
  gst: number;
  category: string;
}

interface Bucket {
  label: string;
  income: number;
  expenses: number;
  incomeItems?: IncomeItem[];
  expenseItems?: ExpenseItem[];
}

function formatLabel(label: string) {
  const [year, month] = label.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

export default function VizSpreadsheet({ data }: { data: Bucket[] }) {
  const [selected, setSelected] = useState<Bucket | null>(null);
  return (
    <div className="overflow-x-auto mt-4" data-testid="viz-spreadsheet">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="w-1/2 text-left">Income</th>
            <th className="w-24 text-center">Month</th>
            <th className="w-1/2 text-right">Expenses</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b) => (
            <tr
              key={b.label}
              className="border-t cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSelected(b)}
            >
              <td className="align-top">
                {b.incomeItems && b.incomeItems.length > 0 ? (
                  b.incomeItems.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.property}</span>
                      <span>${i.amount}</span>
                    </div>
                  ))
                ) : (
                  <div>${b.income}</div>
                )}
              </td>
              <td className="text-center align-top">{formatLabel(b.label)}</td>
              <td className="align-top text-right">
                {b.expenseItems && b.expenseItems.length > 0 ? (
                  b.expenseItems.map((e, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{e.vendor}</span>
                      <span>${e.amount}</span>
                    </div>
                  ))
                ) : (
                  <div>${b.expenses}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-4 rounded shadow max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg mb-2">{formatLabel(selected.label)} Expenses</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Vendor</th>
                  <th className="text-left">Category</th>
                  <th className="text-right">GST</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selected.expenseItems?.map((e, idx) => (
                  <tr key={idx} className="border-t">
                    <td>{e.vendor}</td>
                    <td>{e.category}</td>
                    <td className="text-right">{e.gst}</td>
                    <td className="text-right">{e.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
