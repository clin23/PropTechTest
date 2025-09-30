import { NextResponse } from 'next/server';

import { logEvent } from '../../../../lib/log';
import {
  notificationPreferenceStore,
  nextId,
} from '../../tenant-crm/store';
import {
  zNotificationPreference,
} from '../../../../lib/tenant-crm/schemas';

export async function GET(
  _req: Request,
  { params }: { params: { tenantId: string } }
) {
  const pref = notificationPreferenceStore.find(
    (item) => item.tenantId === params.tenantId
  );

  if (!pref) {
    return NextResponse.json(null);
  }

  return NextResponse.json(zNotificationPreference.parse(pref));
}

export async function PUT(
  req: Request,
  { params }: { params: { tenantId: string } }
) {
  const raw = (await req.json().catch(() => null)) ?? {};
  if (typeof raw !== 'object' || raw === null) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }
  const parsed = zNotificationPreference.safeParse({
    ...raw,
    tenantId: params.tenantId,
    id: (raw as { id?: string }).id ?? nextId('notifPref'),
  });

  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const index = notificationPreferenceStore.findIndex(
    (item) => item.tenantId === params.tenantId
  );

  if (index === -1) {
    notificationPreferenceStore.push(parsed.data);
  } else {
    notificationPreferenceStore[index] = parsed.data;
  }

  logEvent('notif_prefs_updated', { tenantId: params.tenantId });
  return NextResponse.json(parsed.data);
}
