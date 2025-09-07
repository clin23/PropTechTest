import { NextResponse } from 'next/server';
import { expenses } from '../../store';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const idx = expenses.findIndex((e) => e.id === params.id);
  if (idx === -1) {
    return new NextResponse('Not found', { status: 404 });
  }
  expenses.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
