import Link from "next/link";

export default function FinancePage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Finance</h1>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <Link href="/finance/expenses">Expenses</Link>
          </li>
          <li>
            <Link href="/finance/reports">Reports</Link>
          </li>
        </ul>
    </div>
  );
}
