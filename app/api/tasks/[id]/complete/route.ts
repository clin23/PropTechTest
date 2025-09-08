import { completeTask } from '../../../store';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const task = completeTask(params.id);
  if (!task) return new Response('Not found', { status: 404 });
  return Response.json(task);
}
