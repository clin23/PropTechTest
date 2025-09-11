import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    total: 0,
    items: [
      { label: 'A', value: 50 },
      { label: 'B', value: 30 },
    ],
  };
  return NextResponse.json(data);
}
