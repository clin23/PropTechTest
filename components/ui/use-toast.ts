export function useToast() {
  return {
    toast: ({ title, description }: { title: string; description?: string }) => {
      if (typeof window !== "undefined") {
        alert(title + (description ? "\n" + description : ""));
      }
    },
  };
}
