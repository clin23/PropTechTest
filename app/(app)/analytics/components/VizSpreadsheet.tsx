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

interface Props {
  data: Bucket[];
  showIncome?: boolean;
  showExpenses?: boolean;
  showNet?: boolean;
}

export default function VizSpreadsheet({ data, showIncome = true, showExpenses = true, showNet = true }: Props) {
  const [selected, setSelected] = useState<Bucket | null>(null);
  const [ytd, setYtd] = useState<number>(0);
  const both = showIncome && showExpenses;
  const colClass = both ? 'w-1/2' : 'w-full';

  function openBucket(b: Bucket) {
    const [year, month] = b.label.split('-').map(Number);
    const cumulative = data
      .filter((d) => {
        const [y, m] = d.label.split('-').map(Number);
        return y === year && m <= month;
      })
      .reduce((sum, d) => sum + d.income - d.expenses, 0);
    setYtd(cumulative);
    setSelected(b);
  }
  return (
    <div className="overflow-x-auto" data-testid="viz-spreadsheet">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="w-24 text-left px-4">Month</th>
            {showIncome && <th className={`${colClass} text-left px-4`}>Income</th>}
            {showExpenses && <th className={`${colClass} text-left px-4`}>Expenses</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((b) => (
            <tr
              key={b.label}
              className="border-t hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => openBucket(b)}
            >
              <td className="align-top px-4">{formatLabel(b.label)}</td>
              {showIncome && (
                <td className="align-top px-4">
                  {b.incomeItems && b.incomeItems.length > 0
                    ? b.incomeItems.map((i, idx) => (
                        <div key={idx}>${i.amount} {i.property}</div>
                      ))
                    : <div>${b.income}</div>}
                </td>
              )}
              {showExpenses && (
                <td className="align-top px-4">
                  {b.expenseItems && b.expenseItems.length > 0
                    ? b.expenseItems.map((e, idx) => (
                        <div key={idx}>${e.amount} {e.vendor}</div>
                      ))
                    : <div>${b.expenses}</div>}
                </td>
              )}
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
            <h2 className="text-lg mb-2">{formatLabel(selected.label)} Details</h2>
            <div className="mb-4">
              {showNet && <div>Net: ${selected.income - selected.expenses}</div>}
              <div>YTD: ${ytd}</div>
            </div>
            <div className={`grid gap-4 ${both ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showIncome && (
                <div>
                  <h3 className="font-medium mb-1">Income</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left">Property</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.incomeItems && selected.incomeItems.length > 0 ? (
                        selected.incomeItems.map((i, idx) => (
                          <tr key={idx} className="border-t">
                            <td>{i.property}</td>
                            <td className="text-right">{i.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t">
                          <td>Total</td>
                          <td className="text-right">{selected.income}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {showExpenses && (
                <div>
                  <h3 className="font-medium mb-1">Expenses</h3>
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
                      {selected.expenseItems && selected.expenseItems.length > 0 ? (
                        selected.expenseItems.map((e, idx) => (
                          <tr key={idx} className="border-t">
                            <td>{e.vendor}</td>
                            <td>{e.category}</td>
                            <td className="text-right">{e.gst}</td>
                            <td className="text-right">{e.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t">
                          <td colSpan={3}>Total</td>
                          <td className="text-right">{selected.expenses}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
