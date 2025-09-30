import { tenantNotesStore } from './store';
import { logEvent } from '../../../lib/log';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('propertyId');
  const notes = tenantNotesStore.filter((n) => {
    if (propertyId && n.propertyId !== propertyId) return false;
    return true;
  });
  return Response.json(notes);
}

export async function POST(req: Request) {
  const { propertyId, text } = await req.json();
  const note = {
    id: Math.random().toString(36).slice(2),
    propertyId,
    tenantId: 'unknown',
    createdAt: new Date().toISOString(),
    createdByUserId: 'system',
    body: text,
    tags: [],
  };
  tenantNotesStore.unshift(note);
  logEvent('tenant_note_created', { propertyId });
  return Response.json(note);
}
