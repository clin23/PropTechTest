"use client";

import { useState } from "react";
import DocumentUpload from "../../../components/DocumentUpload";
import DocumentsHub from "../../../components/DocumentsHub";

export default function DocumentsPage() {
  const [refresh, setRefresh] = useState(0);
  return (
    <main className="space-y-4 p-4 text-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Documents</h1>
      <DocumentUpload onUploaded={() => setRefresh((r) => r + 1)} />
      <DocumentsHub refresh={refresh} />
    </main>
  );
}
