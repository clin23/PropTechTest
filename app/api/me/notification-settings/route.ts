import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const row = await prisma.mockData.findUnique({
    where: { id: 'notificationSettings' },
  });
  return Response.json(row?.data ?? {});
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const row = await prisma.mockData.findUnique({ where: { id: 'notificationSettings' } });
  const data = { ...(row?.data as any), ...body };
  await prisma.mockData.upsert({
    where: { id: 'notificationSettings' },
    create: { id: 'notificationSettings', type: 'notification', data },
    update: { data },
  });
  return Response.json(data);
}
