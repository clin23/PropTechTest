import { NextResponse } from 'next/server';

import { suggestRentReview } from '../../../../../lib/tenants/mock-store';

export async function POST(
  request: Request,
  { params }: { params: { tenantId: string } }
) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const basis = payload.basis === 'PERCENT' ? 'PERCENT' : 'CPI';
  const amount = Number(payload.amount ?? 0);
  const effectiveDate = typeof payload.effectiveDate === 'string' ? payload.effectiveDate : undefined;

  if (!effectiveDate) {
    return NextResponse.json({ message: 'effectiveDate required' }, { status: 400 });
  }

  try {
    const event = suggestRentReview(params.tenantId, { basis, amount, effectiveDate });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 404 });
  }
}
