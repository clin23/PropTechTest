import type { TaskDto } from "../../types/tasks";

export const STATUS_INDICATOR_TAG_PREFIX = "__status_indicator:";

export type StatusIndicatorValue = {
  label: string;
  color: string;
};

type StatusIndicatorPreset = Readonly<StatusIndicatorValue>;

const normalizeIndicatorLabel = (value?: string) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "To-Do";
  return trimmed;
};

const normalizeIndicatorColor = (value?: string) => {
  if (!value) {
    return "#3b82f6";
  }

  const trimmed = value.trim();

  if (/^#([0-9a-f]{3})$/i.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^#([0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return "#3b82f6";
};

export const normalizeStatusIndicatorValue = (
  value?: Partial<StatusIndicatorValue> | null
): StatusIndicatorValue => ({
  label: normalizeIndicatorLabel(value?.label),
  color: normalizeIndicatorColor(value?.color),
});

const FALLBACK_INDICATOR = normalizeStatusIndicatorValue({
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

  if (rawValue in LEGACY_INDICATOR_OPTIONS) {
    return normalizeStatusIndicatorValue(LEGACY_INDICATOR_OPTIONS[rawValue]);
  }

  try {
    const decoded = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decoded) as Partial<StatusIndicatorValue>;
    return normalizeStatusIndicatorValue(parsed);
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
    return normalizeStatusIndicatorValue(LEGACY_INDICATOR_OPTIONS.doing);
  }

  const normalized = normalizeString(task.status);
  if (
    normalized &&
    normalized !== "done" &&
    normalized in LEGACY_INDICATOR_OPTIONS
  ) {
    return normalizeStatusIndicatorValue(
      LEGACY_INDICATOR_OPTIONS[normalized as keyof typeof LEGACY_INDICATOR_OPTIONS]
    );
  }

  if (isDoneStatus(task.status)) {
    return normalizeStatusIndicatorValue({
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
    return normalizeStatusIndicatorValue({
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
    JSON.stringify(normalizeStatusIndicatorValue(indicator))
  );

  return [...base, `${STATUS_INDICATOR_TAG_PREFIX}${serialized}`];
};

export const getIndicatorPresentation = (
  indicator: StatusIndicatorValue
): StatusIndicatorValue => normalizeStatusIndicatorValue(indicator);
