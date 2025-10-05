import type {
  Reminder,
  ReminderChecklistItem,
  ReminderDocument,
  Property,
} from '../store';
import { createTask, updateTask, deleteTask } from '../store';
import type { TaskDto } from '../../../types/tasks';

const KEY_DATE_TAG = 'key-date';
const CHECKLIST_TAG = 'key-date-checklist';

function formatChecklistDescription(items?: ReminderChecklistItem[]) {
  if (!items || items.length === 0) {
    return undefined;
  }
  return items.map((item, index) => `${index + 1}. ${item.text}`).join('\n');
}

function mapDocumentsToAttachments(documents?: ReminderDocument[]) {
  if (!documents || documents.length === 0) {
    return [] as NonNullable<TaskDto['attachments']>;
  }
  return documents
    .filter((doc) => Boolean(doc.url))
    .map((doc) => ({ name: doc.name, url: doc.url! }));
}

function recurrenceToCadence(recurrence?: string | null): TaskDto['cadence'] {
  if (!recurrence) return 'Immediate';
  const normalized = recurrence.toLowerCase();
  if (normalized.includes('week')) return 'Weekly';
  if (normalized.includes('month')) return 'Monthly';
  if (normalized.includes('year') || normalized.includes('annual')) return 'Yearly';
  if (normalized.includes('custom')) return 'Custom';
  return 'Custom';
}

function buildTaskPayload(reminder: Reminder, property: Property) {
  const description = formatChecklistDescription(reminder.checklist);
  const attachments = mapDocumentsToAttachments(reminder.documents);
  const payload: Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'> = {
    title: reminder.title,
    description: description ?? 'Key date generated task.',
    status: 'todo',
    priority: 'normal',
    cadence: recurrenceToCadence(reminder.recurrence ?? undefined),
    dueDate: reminder.dueDate,
    dueTime: reminder.dueTime,
    properties: [{ id: property.id, address: property.address }],
    attachments: attachments.length ? attachments : undefined,
    tags: [KEY_DATE_TAG],
  };

  if (!description) {
    payload.description = '';
  }

  if (!attachments.length) {
    delete payload.attachments;
  }

  return payload;
}

export function syncReminderTask(
  reminder: Reminder,
  property: Property,
  shouldAttach: boolean,
) {
  const existingChecklistTaskIds = reminder.checklistTaskIds ?? {};

  if (shouldAttach) {
    const payload = buildTaskPayload(reminder, property);
    const normalizedParentPayload: Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'> = {
      ...payload,
      description: payload.description ?? '',
      attachments: payload.attachments ?? [],
      tags: payload.tags ?? [KEY_DATE_TAG],
    };

    let parentTask: TaskDto;
    if (reminder.taskId) {
      const updated = updateTask(reminder.taskId, normalizedParentPayload);
      if (updated) {
        parentTask = updated;
      } else {
        parentTask = createTask(normalizedParentPayload);
        reminder.taskId = parentTask.id;
      }
    } else {
      parentTask = createTask(normalizedParentPayload);
      reminder.taskId = parentTask.id;
    }

    const nextChecklistTaskIds: Record<string, string> = {};
    const checklistItems = reminder.checklist ?? [];
    const childCadence = normalizedParentPayload.cadence ?? 'Immediate';

    checklistItems.forEach((item, index) => {
      const title = item.text.trim().length
        ? item.text.trim()
        : `Checklist item ${index + 1}`;

      const childPayload: Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        description: `Checklist task from key date "${reminder.title}".`,
        status: 'todo',
        priority: 'normal',
        cadence: childCadence,
        dueDate: reminder.dueDate,
        dueTime: reminder.dueTime,
        properties: [
          {
            id: property.id,
            address: property.address,
          },
        ],
        parentId: reminder.taskId ?? parentTask.id,
        tags: [KEY_DATE_TAG, CHECKLIST_TAG],
      };

      const existingTaskId = existingChecklistTaskIds[item.id];
      if (existingTaskId) {
        const updatedChild = updateTask(existingTaskId, childPayload);
        if (updatedChild) {
          nextChecklistTaskIds[item.id] = updatedChild.id;
          return;
        }
      }

      const createdChild = createTask(childPayload);
      nextChecklistTaskIds[item.id] = createdChild.id;
    });

    Object.entries(existingChecklistTaskIds).forEach(([checklistId, taskId]) => {
      if (nextChecklistTaskIds[checklistId]) return;
      deleteTask(taskId);
    });

    reminder.checklistTaskIds = nextChecklistTaskIds;
  } else {
    if (reminder.taskId) {
      deleteTask(reminder.taskId);
    }
    Object.values(existingChecklistTaskIds).forEach((taskId) => {
      deleteTask(taskId);
    });
    reminder.taskId = null;
    reminder.checklistTaskIds = {};
  }
}

export function serializeReminder(reminder: Reminder, propertyAddress: string) {
  return {
    ...reminder,
    recurrence: reminder.recurrence ?? null,
    documents: reminder.documents ?? [],
    checklist: reminder.checklist ?? [],
    checklistTaskIds: reminder.checklistTaskIds ?? {},
    propertyAddress,
  };
}
