"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MessageTenantModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded space-y-2 w-80">
        <h2 className="text-lg font-medium">Message Tenant</h2>
        <p className="text-sm">Messaging form coming soon.</p>
        <div className="flex justify-end pt-2">
          <button className="px-2 py-1 bg-gray-100" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
