export interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  amount: number;
}

export default function ExpensesTable({ rows }: { rows: ExpenseRow[] }) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Date</th>
          <th className="p-2 text-left">Category</th>
          <th className="p-2 text-left">Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-t">
            <td className="p-2">{r.date}</td>
            <td className="p-2">{r.category}</td>
            <td className="p-2">{r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
