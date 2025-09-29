import type { TaskDto } from "../../types/tasks";

export const STATUS_INDICATOR_TAG_PREFIX = "__status_indicator:";

export type StatusIndicatorValue = {
  label: string;
  color: string;
};

type StatusIndicatorPreset = Readonly<StatusIndicatorValue>;

const DEFAULT_INDICATOR_TEMPLATE: StatusIndicatorValue = {
  label: "To-Do",
  color: "#3b82f6",
};

const sanitizeIndicatorLabel = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  return trimmed || DEFAULT_INDICATOR_TEMPLATE.label;
};

const sanitizeIndicatorColor = (value?: string | null) => {
  if (!value) return DEFAULT_INDICATOR_TEMPLATE.color;

  const trimmed = value.trim();

  if (/^#([0-9a-f]{3})$/i.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^#([0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return DEFAULT_INDICATOR_TEMPLATE.color;
};

export const sanitizeStatusIndicatorValue = (
  value?: Partial<StatusIndicatorValue> | null
): StatusIndicatorValue => ({
  label: sanitizeIndicatorLabel(value?.label),
  color: sanitizeIndicatorColor(value?.color),
});

const FALLBACK_INDICATOR = sanitizeStatusIndicatorValue(
  DEFAULT_INDICATOR_TEMPLATE
);

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

const isDoneStatus = (status?: string | null) => {
  const normalized = normalizeString(status);
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

  if (rawValue in LEGACY_INDICATOR_OPTIONS) {
    return sanitizeStatusIndicatorValue(LEGACY_INDICATOR_OPTIONS[rawValue]);
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

  if (isDoneStatus(task.status)) {
    return coerceStatusIndicatorValue(LEGACY_INDICATOR_OPTIONS.done);
  }

  if (isDoingStatus(task.status)) {
    return sanitizeStatusIndicatorValue(LEGACY_INDICATOR_OPTIONS.doing);
  }

  const normalized = normalizeString(task.status);
  if (
    normalized &&
    normalized !== "done" &&
    normalized in LEGACY_INDICATOR_OPTIONS
  ) {
    return sanitizeStatusIndicatorValue(
      LEGACY_INDICATOR_OPTIONS[normalized as keyof typeof LEGACY_INDICATOR_OPTIONS]
    );
  }

  if (isDoneStatus(task.status)) {
    return sanitizeStatusIndicatorValue({
      label: LEGACY_INDICATOR_OPTIONS.done.label,
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
