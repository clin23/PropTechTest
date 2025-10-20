"use client";

import { useCallback, useEffect, useState } from "react";

export type TaskCompletionPreference = "keep" | "archive";

const STORAGE_KEY = "taskCompletionPreference";

export const TASK_COMPLETION_PREFERENCE_OPTIONS: Array<{
  value: TaskCompletionPreference;
  label: string;
  description: string;
}> = [
  {
    value: "keep",
    label: "Keep in list",
    description: "Keep completed tasks visible in their current list.",
  },
  {
    value: "archive",
    label: "Archive automatically",
    description: "Send completed tasks straight to the archive.",
  },
];

function parsePreference(
  value: string | null
): TaskCompletionPreference | null {
  if (value === "keep" || value === "archive") {
    return value;
  }
  return null;
}

export function useTaskCompletionPreference() {
  const [preference, setPreferenceState] = useState<
    TaskCompletionPreference | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setPreferenceState(parsePreference(stored));
  }, []);

  const setPreference = useCallback((next: TaskCompletionPreference) => {
    setPreferenceState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  return { preference, setPreference };
}

export function clearTaskCompletionPreference() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
