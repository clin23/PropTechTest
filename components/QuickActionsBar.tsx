"use client";
import { useState } from "react";

export default function QuickActionsBar() {
  const [action, setAction] = useState<null | 'expense' | 'document' | 'message'>(null);

  return (
    <div className="space-y-2" data-testid="quick-actions">
      <div className="flex gap-2">
        <button className="px-2 py-1 border rounded" onClick={() => setAction('expense')}>
          Log Expense
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => setAction('document')}>
          Upload Document
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => setAction('message')}>
          Message Tenant
        </button>
      </div>
      {action === 'expense' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
            await fetch('/api/expenses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: Number(amount) }),
            });
            setAction(null);
          }}
          className="border p-2 space-y-2"
        >
          <input name="amount" placeholder="Amount" className="border p-1" />
          <button type="submit" className="px-2 py-1 border rounded">
            Save
          </button>
        </form>
      )}
      {action === 'document' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const fileInput = form.elements.namedItem('file') as HTMLInputElement;
            const formData = new FormData();
            if (fileInput.files?.[0]) {
              formData.append('file', fileInput.files[0]);
            }
            await fetch('/api/notifications', {
              method: 'POST',
              body: formData,
            });
            setAction(null);
          }}
          className="border p-2 space-y-2"
        >
          <input name="file" type="file" aria-label="Document" />
          <button type="submit" className="px-2 py-1 border rounded">
            Upload
          </button>
        </form>
      )}
      {action === 'message' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message }),
            });
            setAction(null);
          }}
          className="border p-2 space-y-2"
        >
          <textarea name="message" placeholder="Message to tenant" className="border p-1" />
          <button type="submit" className="px-2 py-1 border rounded">
            Send
          </button>
        </form>
      )}
    </div>
  );
}
