import Link from "next/link";
import PageHeader from "../../components/PageHeader";

export default function FinancePage() {
  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Finance" />
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <Link href="/finance/expenses">Expenses</Link>
        </li>
        <li>
          <Link href="/finance/pnl">P&amp;L</Link>
        </li>
      </ul>
    </div>
  );
}
