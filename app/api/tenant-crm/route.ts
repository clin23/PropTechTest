import { tenantNotes } from '../store';
import { logEvent } from '../../../lib/log';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('propertyId');
  const notes = tenantNotes.filter(
    (n) => !propertyId || n.propertyId === propertyId
  );
  return Response.json(notes);
}

export async function POST(req: Request) {
  const { propertyId, text } = await req.json();
  const note = {
    id: Math.random().toString(36).slice(2),
    propertyId,
    text,
    createdAt: new Date().toISOString(),
  };
  tenantNotes.push(note);
  logEvent('note_add', { propertyId });
  return Response.json(note);
}
