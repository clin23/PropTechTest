"use client";

import { useQuery } from "@tanstack/react-query";
import { listVendors, type Vendor } from "../../../../../lib/api";

interface VendorsProps {
  propertyId: string;
}

export default function Vendors({ propertyId: _propertyId }: VendorsProps) {
  const { data = [], isPending } = useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: listVendors,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Preferred Vendors</h2>
      {isPending ? (
        <div>Loading vendors...</div>
      ) : data.length === 0 ? (
        <div className="rounded border border-dashed p-6 text-center text-gray-500">
          No vendors available
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((vendor) => (
            <div
              key={vendor.id ?? vendor.name}
              className="space-y-2 rounded border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{vendor.name}</h3>
                {vendor.favourite && <span aria-label="Favourite vendor">★</span>}
              </div>
              {vendor.tags && vendor.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {vendor.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span
                  className={`rounded-full px-2 py-1 ${
                    vendor.insured ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {vendor.insured ? "Insured" : "Not insured"}
                </span>
                <span
                  className={`rounded-full px-2 py-1 ${
                    vendor.licensed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {vendor.licensed ? "Licensed" : "No licence"}
                </span>
              </div>
              {vendor.avgResponseTime !== undefined && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Avg response: {vendor.avgResponseTime}h
                </div>
              )}
              {vendor.documents && vendor.documents.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-blue-600">
                  {vendor.documents.map((doc) => (
                    <span key={doc} className="rounded bg-blue-100 px-2 py-1">
                      {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
