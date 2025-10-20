import { NextResponse } from 'next/server';

import { getTenantWorkspace, recordCommunication } from '../../../../../lib/tenants/mock-store';

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const channel = typeof payload.channel === 'string' ? payload.channel.toUpperCase() : '';
  const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
  const body = typeof payload.body === 'string' ? payload.body : undefined;

  if (!['CALL', 'EMAIL', 'SMS'].includes(channel)) {
    return NextResponse.json({ message: 'Invalid channel' }, { status: 400 });
  }

  if (!summary) {
    return NextResponse.json({ message: 'Summary required' }, { status: 400 });
  }

  try {
    const event = recordCommunication(params.tenantId, {
      channel: channel as 'CALL' | 'EMAIL' | 'SMS',
      summary,
      body,
    });
    return NextResponse.json(event, { status: 201 });
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
  const communications = tenant.timeline.filter((event) => event.type === 'MESSAGE');
  return NextResponse.json({ items: communications });
}
