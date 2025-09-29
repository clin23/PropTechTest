import type { TaskDto } from "../../types/tasks";

export const STATUS_INDICATOR_TAG_PREFIX = "__status_indicator:";

export type StatusIndicatorValue = {
  label: string;
  color: string;
};

type StatusIndicatorPreset = Readonly<StatusIndicatorValue>;

const DEFAULT_INDICATOR_PRESET = Object.freeze({
  label: "To-Do",
  color: "var(--chart-1)",
});

const LEGACY_PRESET_REGISTRY = Object.freeze({
  todo: DEFAULT_INDICATOR_PRESET,
  doing: Object.freeze({ label: "In Progress", color: "var(--chart-3)" }),
  done: Object.freeze({ label: "Complete", color: "var(--chart-2)" }),
});

const CUSTOM_STATUS_PRESETS: StatusIndicatorPreset[] = Object.freeze([
  Object.freeze({ label: "Blocked", color: "var(--chart-5)" }),
  Object.freeze({ label: "On Hold", color: "var(--chart-4)" }),
  Object.freeze({ label: "Needs Review", color: "var(--chart-6)" }),
  Object.freeze({ label: "Scheduled", color: "var(--chart-7)" }),
  Object.freeze({ label: "Waiting", color: "var(--chart-8)" }),
]);

export const STATUS_INDICATOR_PRESETS: readonly StatusIndicatorPreset[] = [
  LEGACY_PRESET_REGISTRY.todo,
  LEGACY_PRESET_REGISTRY.doing,
  LEGACY_PRESET_REGISTRY.done,
  ...CUSTOM_STATUS_PRESETS,
] as const;

export const DEFAULT_STATUS_INDICATOR: StatusIndicatorPreset =
  DEFAULT_INDICATOR_PRESET;

const normalizeToLowerCase = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

const sanitizeIndicatorLabel = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  return trimmed || DEFAULT_STATUS_INDICATOR.label;
};

const expandShortHexCode = (value: string) =>
  value
    .split("")
    .map((char) => char + char)
    .join("");

const sanitizeIndicatorColor = (value?: string | null) => {
  if (!value) {
    return DEFAULT_STATUS_INDICATOR.color;
  }

  const trimmed = value.trim();

  if (/^var\(--[a-z0-9-]+\)$/i.test(trimmed)) {
    return trimmed;
  }

  if (/^#([0-9a-f]{3})$/i.test(trimmed)) {
    return `#${expandShortHexCode(trimmed.slice(1)).toLowerCase()}`;
  }

  if (/^#([0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return DEFAULT_STATUS_INDICATOR.color;
};

export const sanitizeStatusIndicatorValue = (
  value?: Partial<StatusIndicatorValue> | null
): StatusIndicatorValue => ({
  label: sanitizeIndicatorLabel(value?.label),
  color: sanitizeIndicatorColor(value?.color),
});

const FALLBACK_INDICATOR = sanitizeStatusIndicatorValue(
  DEFAULT_STATUS_INDICATOR
);

const getLegacyIndicatorPreset = (
  key?: string | null
): StatusIndicatorPreset | null => {
  const presetKey = normalizeToLowerCase(key);
  return (LEGACY_PRESET_REGISTRY as Record<string, StatusIndicatorPreset>)[
    presetKey
  ] ?? null;
};

const isDoneStatus = (status?: string | null) => {
  const normalized = normalizeToLowerCase(status);
  return (
    normalized === "done" ||
    normalized === "complete" ||
    normalized === "completed"
  );
};

const isDoingStatus = (status?: string | null) => {
  const normalized = normalizeToLowerCase(status);
  return (
    normalized === "doing" ||
    normalized === "in_progress" ||
    normalized === "in-progress" ||
    normalized === "in progress"
  );
};

export const extractIndicatorFromTags = (
  tags?: string[] | null
): StatusIndicatorValue | null => {
  if (!tags?.length) {
    return null;
  }

  const serializedIndicator = tags.find((tag) =>
    tag.startsWith(STATUS_INDICATOR_TAG_PREFIX)
  );

  if (!serializedIndicator) {
    return null;
  }

  const [, encodedValue] = serializedIndicator.split(
    STATUS_INDICATOR_TAG_PREFIX
  );

  if (!encodedValue) {
    return null;
  }

  const legacyPreset = getLegacyIndicatorPreset(encodedValue);
  if (legacyPreset) {
    return sanitizeStatusIndicatorValue(legacyPreset);
  }

  try {
    const decoded = decodeURIComponent(encodedValue);
    const parsed = JSON.parse(decoded) as Partial<StatusIndicatorValue>;
    return sanitizeStatusIndicatorValue(parsed);
  } catch (error) {
    console.warn("Failed to parse status indicator tag", error);
    return null;
  }
};

export const deriveIndicatorForTask = (
  task: Pick<TaskDto, "status" | "tags">
): StatusIndicatorValue => {
  const taggedIndicator = extractIndicatorFromTags(task.tags);
  if (taggedIndicator) {
    return taggedIndicator;
  }

  if (isDoingStatus(task.status)) {
    return sanitizeStatusIndicatorValue(LEGACY_PRESET_REGISTRY.doing);
  }

  const normalizedStatus = normalizeToLowerCase(task.status);
  if (normalizedStatus && normalizedStatus !== "done") {
    const legacyPreset = getLegacyIndicatorPreset(normalizedStatus);
    if (legacyPreset) {
      return sanitizeStatusIndicatorValue(legacyPreset);
    }
  }

  if (isDoneStatus(task.status)) {
    return sanitizeStatusIndicatorValue({
      label: LEGACY_PRESET_REGISTRY.done.label,
      color: "var(--text-muted)",
    });
  }

  if (typeof task.status === "string" && task.status.trim()) {
    const label = task.status
      .split(/[_-]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
    return sanitizeStatusIndicatorValue({
      label,
      color: "var(--text-muted)",
    });
  }

  return FALLBACK_INDICATOR;
};

export const mergeIndicatorIntoTags = (
  tags: string[] | undefined,
  indicator: StatusIndicatorValue
): string[] => {
  const baseTags = tags?.filter(
    (tag) => !tag.startsWith(STATUS_INDICATOR_TAG_PREFIX)
  ) ?? [];

  const serialized = encodeURIComponent(
    JSON.stringify(sanitizeStatusIndicatorValue(indicator))
  );

  return [...baseTags, `${STATUS_INDICATOR_TAG_PREFIX}${serialized}`];
};

export const getIndicatorPresentation = (
  indicator: StatusIndicatorValue
): StatusIndicatorValue => sanitizeStatusIndicatorValue(indicator);

export { sanitizeStatusIndicatorValue as normalizeStatusIndicatorValue };
