"use client";

export default function QuickActionsBar() {
  return (
    <div className="flex gap-2">
      <button className="px-2 py-1 bg-blue-500 text-white rounded">+Expense</button>
      <button className="px-2 py-1 bg-green-500 text-white rounded">+Upload Doc</button>
      <button className="px-2 py-1 bg-purple-500 text-white rounded">+Tenant Note</button>
    </div>
  );
}
