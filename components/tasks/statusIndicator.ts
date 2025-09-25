import type { TaskDto } from "../../types/tasks";

export const STATUS_INDICATOR_TAG_PREFIX = "__status_indicator:";

export const STATUS_INDICATOR_OPTIONS = [
  { value: "todo", label: "To-Do", color: "bg-blue-500" },
  { value: "doing", label: "Doing", color: "bg-orange-500" },
  { value: "done", label: "Complete", color: "bg-green-500" },
] as const;

export type StatusIndicatorValue =
  (typeof STATUS_INDICATOR_OPTIONS)[number]["value"];

const optionByValue = STATUS_INDICATOR_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<StatusIndicatorValue, (typeof STATUS_INDICATOR_OPTIONS)[number]>
);

const normalizeString = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

const isDoneStatus = (status?: string | null) => {
  const normalized = normalizeString(status);
  return (
    normalized === "done" ||
    normalized === "completed" ||
    normalized === "complete"
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

export const isStatusIndicatorValue = (
  value: string
): value is StatusIndicatorValue =>
  STATUS_INDICATOR_OPTIONS.some((option) => option.value === value);

export const coerceStatusIndicatorValue = (
  value?: string | null
): StatusIndicatorValue => {
  if (value && isStatusIndicatorValue(value)) {
    return value;
  }
  return "todo";
};

export const extractIndicatorFromTags = (
  tags?: string[] | null
): StatusIndicatorValue | null => {
  if (!tags?.length) return null;
  const match = tags.find((tag) =>
    tag.startsWith(STATUS_INDICATOR_TAG_PREFIX)
  );
  if (!match) return null;
  const [, value] = match.split(STATUS_INDICATOR_TAG_PREFIX);
  return value && isStatusIndicatorValue(value) ? value : null;
};

export const deriveIndicatorForTask = (
  task: Pick<TaskDto, "status" | "tags">
): StatusIndicatorValue => {
  if (isDoneStatus(task.status)) {
    return "done";
  }

  const tagged = extractIndicatorFromTags(task.tags);
  if (tagged) {
    return tagged;
  }

  if (isDoingStatus(task.status)) {
    return "doing";
  }

  return "todo";
};

export const mergeIndicatorIntoTags = (
  tags: string[] | undefined,
  indicator: StatusIndicatorValue
): string[] => {
  const base = tags?.filter(
    (tag) => !tag.startsWith(STATUS_INDICATOR_TAG_PREFIX)
  ) ?? [];

  return [...base, `${STATUS_INDICATOR_TAG_PREFIX}${indicator}`];
};

export const getIndicatorPresentation = (
  indicator: StatusIndicatorValue
) => optionByValue[indicator];
