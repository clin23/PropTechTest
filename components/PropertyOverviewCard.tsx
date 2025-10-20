"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { KeyboardEvent } from "react";
import type { PropertySummary } from "../types/property";

interface Props {
  property: PropertySummary;
  isEditMode?: boolean;
  onSelect?: (property: PropertySummary) => void;
}

export default function PropertyOverviewCard({ property, isEditMode = false, onSelect }: Props) {
  const detailPath = `/properties/${property.id}`;
  const router = useRouter();

  const handleNavigate = useCallback(() => {
    if (isEditMode && onSelect) {
      onSelect(property);
      return;
    }

    router.push(detailPath);
  }, [detailPath, isEditMode, onSelect, property, router]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        handleNavigate();
      }
    },
    [handleNavigate],
  );

  const ariaLabel = isEditMode
    ? `Edit details for ${property.address}`
    : `View details for ${property.address}`;

  return (
    <article
      role={isEditMode ? "button" : "link"}
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className={`group flex h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-950 ${
        isEditMode
          ? "border-dashed border-indigo-300 bg-indigo-50/50 hover:border-indigo-400 dark:border-indigo-500/60 dark:bg-slate-900/60"
          : ""
      }`}
    >
      <div className="relative shrink-0 basis-[65%] overflow-hidden">
        <img
          src={property.imageUrl || "/default-house.svg"}
          alt={`Photo of ${property.address}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex shrink-0 basis-[35%] flex-col justify-between gap-2.5 bg-slate-50/95 px-4 pb-2.5 pt-3 text-slate-900 dark:bg-slate-800/90 dark:text-slate-100">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
            {property.address}
          </h2>
          <p className="text-sm leading-tight text-slate-600 dark:text-slate-300">Tenant: {property.tenant}</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          {isEditMode && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
              Click to edit
            </span>
          )}
          <p className="ml-auto text-right text-lg font-semibold leading-tight text-indigo-600 dark:text-indigo-300">
            ${property.rent}/week
          </p>
        </div>
      </div>
    </article>
  );
}

