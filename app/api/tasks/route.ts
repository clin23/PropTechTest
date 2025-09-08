import { listTasks, createTask } from '../store';
import { zTask } from '../../../lib/validation';
import type { TaskDto } from '../../../types/tasks';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const data = listTasks({
    propertyId: url.searchParams.get('propertyId') || undefined,
    status: url.searchParams.get('status') || undefined,
    cadence: url.searchParams.get('cadence') || undefined,
    q: url.searchParams.get('q') || undefined,
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
    parentId: url.searchParams.get('parentId') || undefined,
  });
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = zTask.parse(body) as TaskDto;
  const task = createTask(parsed);
  return Response.json(task, { status: 201 });
}
