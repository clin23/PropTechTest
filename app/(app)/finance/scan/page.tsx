"use client";

import AIDocScan from "../../../../components/AIDocScan";

export default function ScanPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Scan Receipt</h1>
      <AIDocScan />
    </div>
  );
}

