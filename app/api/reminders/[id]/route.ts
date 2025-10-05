import { properties, updateReminder, deleteReminder, deleteTask } from '../../store';
import { zReminderPayload } from '../../../../lib/validation';
import { serializeReminder, syncReminderTask } from '../utils';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const parsed = zReminderPayload.parse(body);

  const reminder = updateReminder(params.id, {
    propertyId: parsed.propertyId,
    type: parsed.type,
    title: parsed.title,
    dueDate: parsed.dueDate,
    dueTime: parsed.dueTime,
    recurrence: parsed.recurrence ?? null,
    severity: parsed.severity,
    documents: parsed.documents,
    checklist: parsed.checklist,
  });

  if (!reminder) {
    return new Response('Not found', { status: 404 });
  }

  const property = properties.find((p) => p.id === reminder.propertyId);
  if (!property) {
    return new Response('Property not found', { status: 400 });
  }

  const shouldAttach = parsed.addToTasks ?? Boolean(reminder.taskId);
  syncReminderTask(reminder, property, shouldAttach);

  return Response.json(serializeReminder(reminder, property.address));
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const removed = deleteReminder(params.id);
  if (!removed) {
    return new Response('Not found', { status: 404 });
  }
  if (removed.taskId) {
    deleteTask(removed.taskId);
  }
  if (removed.checklistTaskIds) {
    Object.values(removed.checklistTaskIds).forEach((taskId) => {
      deleteTask(taskId);
    });
  }
  return new Response(null, { status: 204 });
}
