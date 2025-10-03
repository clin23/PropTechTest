"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_DOCUMENT_TAGS } from "../types/document";

const STORAGE_KEY = "proptech-document-tags";
const TAG_UPDATE_EVENT = "document-tags:update";

const normalizeTag = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return trimmed
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const parseStoredTags = (raw: string | null) => {
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        .map(normalizeTag);
    }
  } catch (error) {
    console.warn("Failed to parse stored document tags", error);
  }
  return [] as string[];
};

const persistCustomTags = (tags: string[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  window.dispatchEvent(
    new CustomEvent<string[]>(TAG_UPDATE_EVENT, { detail: [...tags] })
  );
};

export function useDocumentTags() {
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCustomTags(parseStoredTags(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setCustomTags(parseStoredTags(event.newValue));
      }
    };

    const handleCustomUpdate = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      if (Array.isArray(detail)) {
        setCustomTags(detail.map(normalizeTag));
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(TAG_UPDATE_EVENT, handleCustomUpdate as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(TAG_UPDATE_EVENT, handleCustomUpdate as EventListener);
    };
  }, []);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    const combined: string[] = [];

    DEFAULT_DOCUMENT_TAGS.forEach((tag) => {
      const key = tag.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(tag);
      }
    });

    [...customTags]
      .sort((a, b) => a.localeCompare(b))
      .forEach((tag) => {
        const normalized = normalizeTag(tag);
        const key = normalized.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(normalized);
        }
      });

    return combined;
  }, [customTags]);

  const addTag = useCallback((value: string) => {
    if (typeof window === "undefined") return undefined;

    const normalizedInput = normalizeTag(value);
    if (!normalizedInput) return undefined;

    const defaultMatch = DEFAULT_DOCUMENT_TAGS.find(
      (tag) => tag.toLowerCase() === normalizedInput.toLowerCase()
    );
    if (defaultMatch) {
      return defaultMatch;
    }

    let result = normalizedInput;

    setCustomTags((prev) => {
      const exists = prev.find(
        (tag) => tag.toLowerCase() === normalizedInput.toLowerCase()
      );

      if (exists) {
        result = exists;
        return prev;
      }

      const next = [...prev, normalizedInput].sort((a, b) => a.localeCompare(b));
      result = normalizedInput;
      persistCustomTags(next);
      return next;
    });

    return result;
  }, []);

  return { tags, addTag } as const;
}

