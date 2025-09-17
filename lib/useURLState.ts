"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseURLStateOptions<T extends string> {
  key: string;
  defaultValue: T;
}

export function useURLState<T extends string>({
  key,
  defaultValue,
}: UseURLStateOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);

  const readValue = useCallback(() => {
    const params = new URLSearchParams(searchString);
    return (params.get(key) as T | null) ?? defaultValue;
  }, [defaultValue, key, searchString]);

  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    const next = readValue();
    setValue((current) => (current === next ? current : next));
  }, [readValue, searchString]);

  const updateValue = useCallback(
    (next: T) => {
      setValue(next);
      const params = new URLSearchParams(searchString);
      if (next === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, next);
      }
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.replace(url, { scroll: false });
    },
    [defaultValue, key, pathname, router, searchString]
  );

  return [value, updateValue] as const;
}
