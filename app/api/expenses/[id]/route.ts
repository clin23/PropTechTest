import { NextResponse } from 'next/server';
import { expenses } from '../../store';
import { zExpense } from '../../../lib/validation';
import { prisma } from '../../../lib/prisma';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const idx = expenses.findIndex((e) => e.id === params.id);
  if (idx === -1) {
    return new NextResponse('Not found', { status: 404 });
  }
  expenses.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const isMockMode = process.env.MOCK_MODE === 'true';

    if (isMockMode) {
      const idx = expenses.findIndex((expense) => expense.id === params.id);
      if (idx === -1) {
        return new NextResponse('Not found', { status: 404 });
      }

      const current = expenses[idx];
      const parsed = zExpense.parse({ ...current, ...body, id: params.id });
      expenses[idx] = parsed;
      return NextResponse.json(parsed);
    }

    const row = await (prisma as any).mockData.findUnique({
      where: { id: params.id },
    });
    if (!row) {
      return new NextResponse('Not found', { status: 404 });
    }

    const parsed = zExpense.parse({ ...(row.data as any), ...body, id: params.id });
    await (prisma as any).mockData.update({
      where: { id: params.id },
      data: { data: parsed },
    });

    return NextResponse.json(parsed);
  } catch (err: any) {
    const message = err?.message ?? 'Invalid expense payload';
    return new NextResponse(message, { status: 400 });
  }
}
