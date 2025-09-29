"use client";

import PropertyForm from "./PropertyForm";
import type { PropertySummary } from "../types/property";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  property: PropertySummary;
  onClose: () => void;
}

export default function PropertyEditModal({ open, property, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="property-edit-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="mb-2 text-lg font-medium">Edit Property</h2>
            <PropertyForm property={property} onSaved={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

