export type TaskCadence = 'Immediate'|'Weekly'|'Monthly'|'Yearly'|'Custom';
export type TaskStatus = 'todo'|'in_progress'|'blocked'|'done';
export type TaskPriority = 'low'|'normal'|'high';
export type TaskDto = {
  id: string;
  title: string;
  description?: string;
  cadence: TaskCadence;
  // Single due date OR a date window for Gantt (start/end)
  dueDate?: string;       // ISO
  startDate?: string;     // ISO (optional, for Gantt)
  endDate?: string;       // ISO (optional, for Gantt)
  recurrence?: {
    // For Weekly/Monthly/Yearly or Custom RRULE-like
    freq: 'WEEKLY'|'MONTHLY'|'YEARLY'|'CUSTOM'|null;
    interval?: number; // e.g., every 2 weeks
    byDay?: string[];  // ['MO','FR'] if weekly
    byMonthDay?: number[]; // [1,15] if monthly
    rrule?: string; // optional raw string if CUSTOM
  } | null;
  properties: { id: string; address: string }[]; // 1..n properties
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string[];       // arbitrary labels
  createdAt: string;
  updatedAt: string;
  // linkage to reminders (optional)
  reminderId?: string | null;
};
