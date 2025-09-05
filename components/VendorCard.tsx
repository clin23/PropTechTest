import type { Vendor } from '../lib/api';

export default function VendorCard({
  vendor,
  onEdit,
  onToggleFavourite,
}: {
  vendor: Vendor;
  onEdit: () => void;
  onToggleFavourite?: (fav: boolean) => void;
}) {
  return (
    <div className="p-4 border rounded space-y-2">
      <div className="flex justify-between items-start">
        <h2 className="font-semibold">{vendor.name}</h2>
        <button
          onClick={() =>
            onToggleFavourite && onToggleFavourite(!vendor.favourite)
          }
          aria-label="Toggle favourite"
        >
          {vendor.favourite ? '★' : '☆'}
        </button>
      </div>
      {vendor.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {vendor.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-200 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {vendor.documents && vendor.documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(vendor.documents ?? []).map((doc: string) => (
            <span
              key={doc}
              className="px-2 py-1 bg-blue-100 rounded text-xs"
            >
              {doc}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button className="px-2 py-1 border rounded text-sm" onClick={onEdit}>
          Edit
        </button>
        <button className="px-2 py-1 border rounded text-sm">
          Invite to Quote
        </button>
      </div>
    </div>
  );
}
