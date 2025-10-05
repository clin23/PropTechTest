"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ErrorState from "../../../../../components/ErrorState";
import Skeleton from "../../../../../components/Skeleton";
import VendorCard from "../../../../../components/VendorCard";
import VendorForm from "../../../../../components/VendorForm";
import { listVendors, updateVendor, type Vendor } from "../../../../../lib/api";

interface VendorsProps {
  propertyId: string;
}

export default function Vendors({ propertyId: _propertyId }: VendorsProps) {
  const queryClient = useQueryClient();
  const { data: vendors = [], isPending, error } = useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: listVendors,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
      updateVendor(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendors"] }),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const handleClose = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Preferred Vendors</h2>
        <button
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          New Vendor
        </button>
      </div>
      {isPending ? (
        <Skeleton className="h-24" />
      ) : error ? (
        <ErrorState message={error instanceof Error ? error.message : "Failed to load vendors"} />
      ) : vendors.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No vendors available
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id ?? vendor.name}
              vendor={vendor}
              onEdit={() => {
                setEditing(vendor);
                setDrawerOpen(true);
              }}
              onToggleFavourite={(fav) =>
                vendor.id &&
                update.mutate({
                  id: vendor.id,
                  data: { favourite: fav },
                })
              }
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl"
            >
              <VendorForm vendor={editing || undefined} onClose={handleClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
