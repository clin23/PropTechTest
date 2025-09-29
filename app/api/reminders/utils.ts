import type {
  Reminder,
  ReminderChecklistItem,
  ReminderDocument,
  Property,
} from '../store';
import { createTask, updateTask, deleteTask } from '../store';
import type { TaskDto } from '../../../types/tasks';

const KEY_DATE_TAG = 'key-date';

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
  if (shouldAttach) {
    const payload = buildTaskPayload(reminder, property);
    if (reminder.taskId) {
      const updated = updateTask(reminder.taskId, {
        ...payload,
        description: payload.description ?? '',
        attachments: payload.attachments ?? [],
        tags: payload.tags,
      });
      if (!updated) {
        const created = createTask(payload);
        reminder.taskId = created.id;
      }
    } else {
      const created = createTask(payload);
      reminder.taskId = created.id;
    }
  } else if (reminder.taskId) {
    deleteTask(reminder.taskId);
    reminder.taskId = null;
  }
}

export function serializeReminder(reminder: Reminder, propertyAddress: string) {
  return {
    ...reminder,
    recurrence: reminder.recurrence ?? null,
    documents: reminder.documents ?? [],
    checklist: reminder.checklist ?? [],
    propertyAddress,
  };
}
