import { unarchiveTask } from '../../../store';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ok = unarchiveTask(params.id);
  if (!ok) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(null, { status: 204 });
}

