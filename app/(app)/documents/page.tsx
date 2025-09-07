"use client";

import { useState } from "react";
import DocumentUpload from "../../../components/DocumentUpload";
import DocumentsHub from "../../../components/DocumentsHub";

export default function DocumentsPage() {
  const [refresh, setRefresh] = useState(0);
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Documents</h1>
      <DocumentUpload onUploaded={() => setRefresh((r) => r + 1)} />
      <DocumentsHub refresh={refresh} />
    </main>
  );
}
