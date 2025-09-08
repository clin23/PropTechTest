import { tasks } from '../store';
import { zTask } from '../../../lib/validation';
import type { TaskDto } from '../../../types/tasks';

export async function GET(req: Request) {
  const url = new URL(req.url);
  let data = [...tasks];

  const propertyId = url.searchParams.get('propertyId');
  const cadence = url.searchParams.get('cadence');
  const status = url.searchParams.get('status');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const search = url.searchParams.get('search');

  if (propertyId) {
    data = data.filter((t) => t.properties.some((p) => p.id === propertyId));
  }
  if (cadence) {
    data = data.filter((t) => t.cadence === cadence);
  }
  if (status) {
    data = data.filter((t) => t.status === status);
  }
  if (from || to) {
    const fromTime = from ? Date.parse(from) : undefined;
    const toTime = to ? Date.parse(to) : undefined;
    data = data.filter((t) => {
      const start = t.startDate || t.dueDate;
      const end = t.endDate || t.dueDate;
      const s = start ? Date.parse(start) : undefined;
      const e = end ? Date.parse(end) : undefined;
      if (fromTime && e && e < fromTime) return false;
      if (toTime && s && s > toTime) return false;
      return true;
    });
  }
  if (search) {
    const s = search.toLowerCase();
    data = data.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description ? t.description.toLowerCase().includes(s) : false)
    );
  }

  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = zTask.parse(body);
  const now = new Date().toISOString();
  const task: TaskDto = {
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return Response.json(task, { status: 201 });
}
