"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import PropertyForm from "./PropertyForm";
import type { PropertySummary } from "../types/property";

interface Props {
  open: boolean;
  property: PropertySummary;
  onClose: () => void;
}

export default function PropertyEditModal({ open, property, onClose }: Props) {
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  return (
    <AnimatePresence>
      {open &&
        portalTarget &&
        createPortal(
          <motion.div
            key="property-edit-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/10 dark:bg-slate-950 dark:text-slate-100 dark:ring-white/10"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative border-b border-slate-200/80 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-5 dark:border-slate-800/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                      Edit mode active
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold leading-snug text-slate-900 dark:text-white">
                        {property.address}
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                        Update the property details below. When you're ready to apply the changes, slide to confirm and save.
                      </p>
                    </div>
                    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                      {property.tenant && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-500 dark:text-slate-400">Tenant</span>
                          <span>{property.tenant}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Rent</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-300">${property.rent}/week</span>
                      </div>
                    </dl>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white text-slate-500 transition hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
                    aria-label="Close edit property dialog"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 6l8 8m0-8-8 8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-8">
                <PropertyForm
                  key={property.id}
                  property={property}
                  onSaved={onClose}
                  onCancel={onClose}
                  requireSlideConfirmation
                />
              </div>
            </motion.div>
          </motion.div>,
          portalTarget,
        )}
    </AnimatePresence>
  );
}

