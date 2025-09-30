import { NextResponse } from 'next/server';

import { logEvent } from '../../../../lib/log';
import { tenantNotesStore } from '../../tenant-crm/store';
import {
  zTenantNote,
  zTenantNoteUpdate,
} from '../../../../lib/tenant-crm/schemas';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const note = tenantNotesStore.find((item) => item.id === params.id);
  if (!note) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = zTenantNoteUpdate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  Object.assign(note, parsed.data);
  const payload = zTenantNote.parse(note);
  logEvent('tenant_note_updated', { noteId: note.id });
  return NextResponse.json(payload);
}
