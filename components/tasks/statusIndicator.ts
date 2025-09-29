import type { TaskDto } from "../../types/tasks";

export const STATUS_INDICATOR_TAG_PREFIX = "__status_indicator:";

export type StatusIndicatorValue = {
  label: string;
  color: string;
};

type StatusIndicatorPreset = Readonly<StatusIndicatorValue>;

export const DEFAULT_STATUS_INDICATOR: StatusIndicatorPreset = Object.freeze({
  label: "To-Do",
  color: "#3b82f6",
});

const sanitizeIndicatorLabel = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  return trimmed || DEFAULT_STATUS_INDICATOR.label;
};

const sanitizeIndicatorColor = (value?: string | null) => {
  if (!value) return DEFAULT_STATUS_INDICATOR.color;

  const trimmed = value.trim();

  if (/^#([0-9a-f]{3})$/i.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
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

const LEGACY_TODO_PRESET: StatusIndicatorPreset = DEFAULT_STATUS_INDICATOR;
const LEGACY_DOING_PRESET: StatusIndicatorPreset = Object.freeze({
  label: "In Progress",
  color: "#f97316",
});
const LEGACY_DONE_PRESET: StatusIndicatorPreset = Object.freeze({
  label: "Complete",
  color: "#22c55e",
});

export const STATUS_INDICATOR_PRESETS: StatusIndicatorPreset[] = [
  LEGACY_TODO_PRESET,
  LEGACY_DOING_PRESET,
  LEGACY_DONE_PRESET,
  Object.freeze({ label: "Blocked", color: "#ef4444" }),
  Object.freeze({ label: "On Hold", color: "#a855f7" }),
  Object.freeze({ label: "Needs Review", color: "#0ea5e9" }),
  Object.freeze({ label: "Scheduled", color: "#8b5cf6" }),
  Object.freeze({ label: "Waiting", color: "#facc15" }),
];

const normalizeString = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

const getLegacyIndicatorPreset = (
  key?: string | null
): StatusIndicatorPreset | null => {
  switch (normalizeString(key)) {
    case "todo":
      return LEGACY_TODO_PRESET;
    case "doing":
      return LEGACY_DOING_PRESET;
    case "done":
      return LEGACY_DONE_PRESET;
    default:
      return null;
  }
};

const isDoneStatus = (status?: string | null) => {
  const normalized = normalizeString(status);
  return (
    normalized === "done" ||
    normalized === "complete" ||
    normalized === "completed"
  );
};

const isDoingStatus = (status?: string | null) => {
  const normalized = normalizeString(status);
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
  if (!tags?.length) return null;
  const match = tags.find((tag) =>
    tag.startsWith(STATUS_INDICATOR_TAG_PREFIX)
  );
  if (!match) return null;
  const [, rawValue] = match.split(STATUS_INDICATOR_TAG_PREFIX);
  if (!rawValue) return null;

  const legacyPreset = getLegacyIndicatorPreset(rawValue);
  if (legacyPreset) {
    return sanitizeStatusIndicatorValue(legacyPreset);
  }

  try {
    const decoded = decodeURIComponent(rawValue);
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
  const tagged = extractIndicatorFromTags(task.tags);
  if (tagged) {
    return tagged;
  }

  if (isDoingStatus(task.status)) {
    return sanitizeStatusIndicatorValue(LEGACY_DOING_PRESET);
  }

  const normalized = normalizeString(task.status);
  if (normalized && normalized !== "done") {
    const legacyPreset = getLegacyIndicatorPreset(normalized);
    if (legacyPreset) {
      return sanitizeStatusIndicatorValue(legacyPreset);
    }
  }

  if (isDoneStatus(task.status)) {
    return sanitizeStatusIndicatorValue({
      label: LEGACY_DONE_PRESET.label,
      color: "#6b7280",
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
      color: "#6b7280",
    });
  }

  return FALLBACK_INDICATOR;
};

export const mergeIndicatorIntoTags = (
  tags: string[] | undefined,
  indicator: StatusIndicatorValue
): string[] => {
  const base = tags?.filter(
    (tag) => !tag.startsWith(STATUS_INDICATOR_TAG_PREFIX)
  ) ?? [];

  const serialized = encodeURIComponent(
    JSON.stringify(sanitizeStatusIndicatorValue(indicator))
  );

  return [...base, `${STATUS_INDICATOR_TAG_PREFIX}${serialized}`];
};

export const getIndicatorPresentation = (
  indicator: StatusIndicatorValue
): StatusIndicatorValue => sanitizeStatusIndicatorValue(indicator);

export { sanitizeStatusIndicatorValue as normalizeStatusIndicatorValue };
