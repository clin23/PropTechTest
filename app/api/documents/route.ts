import { randomUUID } from 'crypto';
import { prisma } from '../../../lib/prisma';

const seedDocs = [
  {
    id: randomUUID(),
    name: 'lease.pdf',
    property: '123 Main St',
    tag: 'Lease',
    url: '/files/lease.pdf',
  },
  {
    id: randomUUID(),
    name: 'insurance.pdf',
    property: '456 Oak Ave',
    tag: 'Insurance',
    url: '/files/insurance.pdf',
  },
  {
    id: randomUUID(),
    name: 'inspection.pdf',
    property: '123 Main St',
    tag: 'Compliance',
    url: '/files/inspection.pdf',
  },
];

async function ensureSeed() {
  const count = await prisma.mockData.count({ where: { type: 'document' } });
  if (count === 0) {
    for (const doc of seedDocs) {
      await prisma.mockData.create({
        data: { id: doc.id, type: 'document', data: doc },
      });
    }
  }
}

export async function GET(req: Request) {
  await ensureSeed();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();
  const property = searchParams.get('property');
  const tag = searchParams.get('tag');

  const rows = await prisma.mockData.findMany({ where: { type: 'document' } });
  const docs = rows
    .map((r) => r.data as any)
    .filter((d) =>
      (!search || d.name.toLowerCase().includes(search)) &&
      (!property || d.property === property) &&
      (!tag || d.tag === tag)
    );
  return Response.json(docs);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file');
  const property = String(form.get('property') || '');
  const tag = String(form.get('tag') || 'Other');
  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'File required' }, { status: 400 });
  }
  const doc = {
    id: randomUUID(),
    name: file.name,
    property,
    tag,
    url: `/uploads/${file.name}`,
  };
  await prisma.mockData.create({ data: { id: doc.id, type: 'document', data: doc } });
  return Response.json(doc);
}
