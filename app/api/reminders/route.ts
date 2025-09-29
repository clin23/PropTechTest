import {
  reminders,
  properties,
  isActiveProperty,
  createReminder,
  type Reminder,
} from '../store';
import { zReminderPayload } from '../../../lib/validation';
import { serializeReminder, syncReminderTask } from './utils';

function resolvePropertyMap(includeArchived: boolean) {
  const source = includeArchived ? properties : properties.filter(isActiveProperty);
  return new Map(source.map((p) => [p.id, p]));
}

function formatReminders(data: Reminder[], includeArchived: boolean) {
  const map = resolvePropertyMap(includeArchived);
  return data
    .filter((item) => map.has(item.propertyId))
    .map((item) => {
      const property = map.get(item.propertyId)!;
      return serializeReminder(item, property.address);
    });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === 'true';
  const propertyId = url.searchParams.get('propertyId');

  let data = reminders;
  if (propertyId) {
    data = data.filter((r) => r.propertyId === propertyId);
  }
  return Response.json(formatReminders(data, includeArchived));
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = zReminderPayload.parse(body);
  const property = properties.find((p) => p.id === parsed.propertyId);
  if (!property) {
    return new Response('Property not found', { status: 400 });
  }

  const reminder = createReminder({
    propertyId: parsed.propertyId,
    type: parsed.type,
    title: parsed.title,
    dueDate: parsed.dueDate,
    dueTime: parsed.dueTime,
    recurrence: parsed.recurrence ?? null,
    severity: parsed.severity,
    documents: parsed.documents,
    checklist: parsed.checklist,
    taskId: null,
  });

  syncReminderTask(reminder, property, Boolean(parsed.addToTasks));

  return Response.json(serializeReminder(reminder, property.address), {
    status: 201,
  });
}
