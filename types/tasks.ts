export type TaskCadence = 'Immediate'|'Weekly'|'Monthly'|'Yearly'|'Custom';
// Allow arbitrary statuses so users can create custom columns in the Kanban board
export type TaskStatus  = string;
export type TaskPriority = 'low'|'normal'|'high';

export type TaskDto = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;            // checkbox maps todo/done
  completed?: boolean;
  priority: TaskPriority;
  cadence: TaskCadence;          // bucket for later Kanban
  dueDate?: string;              // ISO
  dueTime?: string;              // HH:mm optional
  startDate?: string;            // for Gantt (optional)
  endDate?: string;              // for Gantt (optional)
  recurrence?: {
    freq: 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'|'CUSTOM'|null;
    interval?: number;           // every N units
    byDay?: string[];            // ['MO','FR'] etc
    byMonthDay?: number[];       // [1,15]
    rrule?: string;              // raw string if CUSTOM
    endsOn?: string | null;      // ISO date limit
  } | null;
  properties: { id: string; address: string }[]; // 1..n properties
  vendor?: { id: string; name: string } | null;
  tags?: string[];
  attachments?: { name: string; url: string }[];
  parentId?: string | null;      // for subtasks
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
};
