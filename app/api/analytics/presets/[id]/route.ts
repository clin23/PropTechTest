import { NextResponse } from 'next/server';
let presets: any[] = [];

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  presets = presets.filter(p => p.id !== params.id);
  return NextResponse.json({ ok: true });
}
