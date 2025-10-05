"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastVariant = "default" | "success" | "destructive";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInstance = ToastOptions & { id: number };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<ToastVariant, string> = {
  default:
    "border border-gray-200 bg-white/95 text-gray-900 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-100",
  success: "bg-emerald-500 text-white shadow-lg",
  destructive: "bg-red-500 text-white shadow-lg",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default" }: ToastOptions) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map(({ id, title, description, variant = "default" }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto overflow-hidden rounded-lg px-4 py-3 ${variantStyles[variant]}`}
              role={variant === "destructive" ? "alert" : "status"}
              aria-live={variant === "destructive" ? "assertive" : "polite"}
            >
              <div className="font-medium">{title}</div>
              {description && (
                <div className="mt-1 text-sm opacity-90">{description}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
