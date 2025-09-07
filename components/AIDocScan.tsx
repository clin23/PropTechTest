"use client";

import { useState } from "react";
import ExpenseForm from "./ExpenseForm";
import { scanReceipt } from "../lib/api";

interface Parsed {
  date: string;
  amount: number;
  category: string;
  vendor: string;
  notes: string;
}

export default function AIDocScan() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [open, setOpen] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const data = await scanReceipt(file);
    setParsed(data);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed p-4 text-center"
      >
        Drag & drop receipt
        <input
          type="file"
          className="block mx-auto mt-2"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {parsed && (
        <div className="border p-4 space-y-1">
          <div>Date: {parsed.date}</div>
          <div>Amount: {parsed.amount}</div>
          <div>Category: {parsed.category}</div>
          <div>Vendor: {parsed.vendor}</div>
          <div>Notes: {parsed.notes}</div>
          <button
            className="mt-2 px-2 py-1 bg-green-500 text-white"
            onClick={() => setOpen(true)}
          >
            Apply to Expense
          </button>
        </div>
      )}
      <ExpenseForm
        open={open}
        onOpenChange={setOpen}
        showTrigger={false}
        defaults={parsed || undefined}
        onCreated={() => {
          setOpen(false);
          setParsed(null);
        }}
      />
    </div>
  );
}

