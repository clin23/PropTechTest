import { NextResponse } from 'next/server';
let presets: any[] = [];

export async function GET() {
  return NextResponse.json(presets);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = Date.now().toString();
  presets.push({ id, ...body });
  return NextResponse.json({ id });
}
