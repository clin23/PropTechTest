import { prisma } from '../../../../../../lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; incomeId: string } }
) {
  const row = await prisma.mockData.findUnique({ where: { id: params.incomeId } });
  if (row && (row.data as any).propertyId === params.id) {
    return Response.json(row.data);
  }
  return Response.json(null);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; incomeId: string } }
) {
  const body = await req.json();
  const row = await prisma.mockData.findUnique({ where: { id: params.incomeId } });
  if (!row || (row.data as any).propertyId !== params.id) {
    return Response.json(null);
  }
  const data = { ...row.data, ...body } as any;
  await prisma.mockData.update({
    where: { id: params.incomeId },
    data: { data },
  });
  return Response.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; incomeId: string } }
) {
  const row = await prisma.mockData.findUnique({ where: { id: params.incomeId } });
  if (!row || (row.data as any).propertyId !== params.id) {
    return new Response(null, { status: 404 });
  }
  await prisma.mockData.delete({ where: { id: params.incomeId } });
  return new Response(null, { status: 204 });
}
