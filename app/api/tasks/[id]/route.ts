import { tasks } from '../../store';
import { zTask } from '../../../../lib/validation';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id);
  if (!task) return new Response('Not found', { status: 404 });
  return Response.json(task);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const idx = tasks.findIndex((t) => t.id === params.id);
  if (idx === -1) return new Response('Not found', { status: 404 });
  const body = await req.json();
  const parsed = zTask.partial().parse(body);
  const task = tasks[idx];
  Object.assign(task, parsed);
  task.updatedAt = new Date().toISOString();
  return Response.json(task);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const idx = tasks.findIndex((t) => t.id === params.id);
  if (idx === -1) return new Response('Not found', { status: 404 });
  tasks.splice(idx, 1);
  return new Response(null, { status: 204 });
}
