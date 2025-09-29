import type { TaskDto } from "../../types/tasks";

export const STATUS_INDICATOR_TAG_PREFIX = "__status_indicator:";

export type StatusIndicatorValue = {
  label: string;
  color: string;
};

type StatusIndicatorPreset = Readonly<StatusIndicatorValue>;

const DEFAULT_INDICATOR_PRESET = Object.freeze({
  label: "To-Do",
  color: "#3b82f6",
});

const LEGACY_PRESET_REGISTRY = Object.freeze({
  todo: DEFAULT_INDICATOR_PRESET,
  doing: Object.freeze({ label: "In Progress", color: "#f97316" }),
  done: Object.freeze({ label: "Complete", color: "#22c55e" }),
});

const CUSTOM_STATUS_PRESETS: StatusIndicatorPreset[] = Object.freeze([
  Object.freeze({ label: "Blocked", color: "#ef4444" }),
  Object.freeze({ label: "On Hold", color: "#a855f7" }),
  Object.freeze({ label: "Needs Review", color: "#0ea5e9" }),
  Object.freeze({ label: "Scheduled", color: "#8b5cf6" }),
  Object.freeze({ label: "Waiting", color: "#facc15" }),
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
  const normalized = normalizeToLowerCase(status);
  return (
    normalized === "done" ||
    normalized === "complete" ||
    normalized === "completed"
  );
};

const expandShortHex = (value: string) =>
  value
    .split("")
    .map((char) => char + char)
    .join("");

const sanitizeColor = (value?: string) => {
  if (!value) {
    return "#3b82f6";
  }

  const trimmed = value.trim();

  if (/^#([0-9a-f]{3})$/i.test(trimmed)) {
    return `#${expandShortHex(trimmed.slice(1)).toLowerCase()}`;
  }

  if (/^#([0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return "#3b82f6";
};

export const coerceStatusIndicatorValue = (
  value?: Partial<StatusIndicatorValue> | null
): StatusIndicatorValue => ({
  label: sanitizeLabel(value?.label),
  color: sanitizeColor(value?.color),
});

const DEFAULT_INDICATOR = coerceStatusIndicatorValue({
  label: "To-Do",
  color: "#3b82f6",
});

const LEGACY_INDICATOR_OPTIONS: Record<string, StatusIndicatorPreset> = {
  todo: { label: "To-Do", color: "#3b82f6" },
  doing: { label: "In Progress", color: "#f97316" },
  done: { label: "Complete", color: "#22c55e" },
};

export const STATUS_INDICATOR_PRESETS: StatusIndicatorPreset[] = [
  LEGACY_INDICATOR_OPTIONS.todo,
  LEGACY_INDICATOR_OPTIONS.doing,
  LEGACY_INDICATOR_OPTIONS.done,
  { label: "Blocked", color: "#ef4444" },
  { label: "On Hold", color: "#a855f7" },
  { label: "Needs Review", color: "#0ea5e9" },
  { label: "Scheduled", color: "#8b5cf6" },
  { label: "Waiting", color: "#facc15" },
];

const normalizeString = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

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
