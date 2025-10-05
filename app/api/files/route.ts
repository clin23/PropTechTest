import { NextResponse } from 'next/server';

import { uploadFile } from '../../../lib/tenants/mock-store';

export async function POST(request: Request) {
  const formData = await request.formData();
  const tenantId = formData.get('tenantId');
  const file = formData.get('file');

  if (typeof tenantId !== 'string' || !tenantId) {
    return NextResponse.json({ message: 'tenantId required' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'file required' }, { status: 400 });
  }

  const uploaded = uploadFile(tenantId, { name: file.name, previewUrl: undefined });

  return NextResponse.json({
    id: uploaded.id,
    previewUrl: uploaded.previewUrl ?? null,
    tenantId,
    uploadedAt: uploaded.uploadedAt,
  });
}
