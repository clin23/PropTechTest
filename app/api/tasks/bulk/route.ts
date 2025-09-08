import { z } from 'zod';
import { listTasks, completeTask, deleteTask, updateTask } from '../../store';
import type { TaskDto } from '../../../../types/tasks';

const bulkSchema = z.object({
  ids: z.array(z.string()),
  op: z.enum(['complete','delete','status','priority','assignProperties']),
  status: z.enum(['todo','in_progress','blocked','done']).optional(),
  priority: z.enum(['low','normal','high']).optional(),
  properties: z
    .array(z.object({ id: z.string(), address: z.string() }))
    .optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bulkSchema.parse(body);
  for (const id of parsed.ids) {
    switch (parsed.op) {
      case 'complete':
        completeTask(id);
        break;
      case 'delete':
        deleteTask(id);
        break;
      case 'status':
        if (parsed.status) updateTask(id, { status: parsed.status });
        break;
      case 'priority':
        if (parsed.priority) updateTask(id, { priority: parsed.priority });
        break;
      case 'assignProperties':
        if (parsed.properties)
          updateTask(id, { properties: parsed.properties as TaskDto['properties'] });
        break;
    }
  }
  return Response.json(listTasks());
}
