import { NextResponse } from 'next/server';

import { getTenantWorkspace, recordTask } from '../../../../../lib/tenants/mock-store';

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const dueAt = typeof payload.dueAt === 'string' ? payload.dueAt : undefined;
  const status = typeof payload.status === 'string' ? payload.status : undefined;
  const assignee = typeof payload.assignee === 'string' ? payload.assignee : undefined;

  if (!title) {
    return NextResponse.json({ message: 'Task title required' }, { status: 400 });
  }

  try {
    const task = recordTask(params.tenantId, { title, dueAt, status, assignee });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 404 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { tenantId: string } }
) {
  const tenant = getTenantWorkspace(params.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
  }
  return NextResponse.json({ items: tenant.tasks });
}
