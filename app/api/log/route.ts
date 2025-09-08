import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, payload } = await req.json();
    console.log('event', name, payload);
  } catch {
    // ignore parse errors
  }
  return new NextResponse(null, { status: 204 });
}
