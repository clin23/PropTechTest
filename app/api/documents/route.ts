import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { documents } from '../store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');
  const tag = searchParams.get('tag');
  const query = searchParams.get('query')?.toLowerCase();

  let results = documents;
  if (propertyId) {
    results = results.filter((d) => d.propertyId === propertyId);
  }
  if (tag) {
    results = results.filter((d) => d.tag === tag);
  }
  if (query) {
    results = results.filter((d) => d.title.toLowerCase().includes(query));
  }

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, title, tag, propertyId } = body || {};
    if (!url || !title) {
      return NextResponse.json({ error: 'url and title required' }, { status: 400 });
    }
    const doc = { id: randomUUID(), url, title, tag: tag || 'Other', propertyId };
    documents.push(doc as any);
    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
