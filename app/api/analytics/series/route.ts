import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    total: 0,
    buckets: [
      { label: '2024-01', value: 100 },
      { label: '2024-02', value: 150 },
    ],
  };
  return NextResponse.json(data);
}
