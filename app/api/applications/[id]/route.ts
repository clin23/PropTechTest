import { prisma } from '../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = await prisma.mockData.findUnique({ where: { id: params.id } });
  return Response.json(row?.data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const row = await prisma.mockData.findUnique({ where: { id: params.id } });
  if (!row) return Response.json(null);
  const data = { ...row.data, ...body } as any;
  await prisma.mockData.update({ where: { id: params.id }, data: { data } });
  return Response.json(data);
}
