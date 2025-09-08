import React from "react";

export default function PropertyBadge({ address }: { address: string }) {
  return (
    <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700">
      {address}
    </span>
  );
}
