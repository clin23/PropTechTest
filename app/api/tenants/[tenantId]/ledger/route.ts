import { NextResponse } from 'next/server';

import { getTenantWorkspace, recordLedgerEntry } from '../../../../../lib/tenants/mock-store';

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }
  const type = typeof payload.type === 'string' ? payload.type : undefined;
  const amount = Number(payload.amountCents ?? payload.amount ?? NaN);
  const note = typeof payload.note === 'string' ? payload.note : undefined;

  if (!type || !['RENT', 'PAYMENT', 'EXPENSE', 'ADJUSTMENT'].includes(type)) {
    return NextResponse.json({ message: 'Invalid ledger type' }, { status: 400 });
  }
  if (!Number.isFinite(amount)) {
    return NextResponse.json({ message: 'Amount required' }, { status: 400 });
  }

  try {
    const entry = recordLedgerEntry(params.tenantId, {
      type: type as any,
      amountCents: Math.round(amount),
      note,
    });
    return NextResponse.json(entry, { status: 201 });
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
  return NextResponse.json({ items: tenant.ledger });
}
