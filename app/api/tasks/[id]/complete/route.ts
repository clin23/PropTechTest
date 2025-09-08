import { tasks } from '../../../store';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id);
  if (!task) return new Response('Not found', { status: 404 });
  task.status = 'done';
  task.updatedAt = new Date().toISOString();
  return Response.json(task);
}
