import { getTask, updateTask, deleteTask } from '../../store';
import { zTask } from '../../../../lib/validation';
import type { TaskDto } from '../../../../types/tasks';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const task = getTask(params.id);
  if (!task) return new Response('Not found', { status: 404 });
  return Response.json(task);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = zTask.partial().parse(body) as Partial<TaskDto>;

  const payload = Object.entries(parsed).reduce<Partial<TaskDto>>(
    (acc, [key, value]) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        acc[key as keyof TaskDto] = value as TaskDto[keyof TaskDto];
      }
      return acc;
    },
    {}
  );

  const task = updateTask(params.id, payload);
  if (!task) return new Response('Not found', { status: 404 });
  return Response.json(task);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ok = deleteTask(params.id);
  if (!ok) return new Response('Not found', { status: 404 });
  return new Response(null, { status: 204 });
}
