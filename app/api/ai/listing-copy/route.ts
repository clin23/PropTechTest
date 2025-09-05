import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { features } = await req.json();
  return NextResponse.json({ text: `Ad copy for ${features}` });
}
