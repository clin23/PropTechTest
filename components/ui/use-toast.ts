import { useCallback } from "react";

export function useToast() {
  const toast = useCallback(
    ({ title, description }: { title: string; description?: string }) => {
      if (typeof window !== "undefined") {
        alert(title + (description ? "\n" + description : ""));
      }
    },
    []
  );

  return { toast };
}
