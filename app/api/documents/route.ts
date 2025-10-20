import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { documents } from '../store';
import { logEvent } from '../../../lib/log';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');
  const tag = searchParams.get('tag');
  const query = searchParams.get('query')?.toLowerCase();

  let results;
  if (process.env.MOCK_MODE === 'true') {
    results = documents;
  } else {
    const records = await (prisma as any).mockData.findMany({
      where: { type: 'document' },
    });
    results = records.map((r: any) => r.data);
  }

  if (propertyId) {
    results = results.filter((d: any) => d.propertyId === propertyId);
  }
  if (tag) {
    results = results.filter((d: any) => d.tag === tag);
  }
  if (query) {
    results = results.filter((d: any) =>
      d.title.toLowerCase().includes(query)
    );
  }

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, title, tag, propertyId, notes, links, uploadedAt } = body || {};
    if (!url || !title) {
      return NextResponse.json({ error: 'url and title required' }, { status: 400 });
    }
    const doc = {
      id: randomUUID(),
      url,
      title,
      tag: tag || 'Other',
      propertyId,
      notes,
      links,
      uploadedAt: uploadedAt || new Date().toISOString(),
    };
    if (process.env.MOCK_MODE === 'true') {
      documents.push(doc as any);
    } else {
      await (prisma as any).mockData.create({
        data: { id: doc.id, type: 'document', data: doc },
      });
    }
    logEvent('document_upload', { propertyId, tag, title });
    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
