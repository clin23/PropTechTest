import { prisma } from '../../../../../lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { url } = await req.json();
  const vendorRow = await prisma.mockData.findUnique({ where: { id: params.id } });
  if (!vendorRow) return Response.json(null);
  const vendor = vendorRow.data as any;
  vendor.documents = vendor.documents || [];
  vendor.documents.push(url);
  await prisma.mockData.update({ where: { id: params.id }, data: { data: vendor } });
  return Response.json(vendor);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { url } = await req.json();
  const vendorRow = await prisma.mockData.findUnique({ where: { id: params.id } });
  if (!vendorRow) return Response.json(null);
  const vendor = vendorRow.data as any;
  vendor.documents = (vendor.documents || []).filter((d: string) => d !== url);
  await prisma.mockData.update({ where: { id: params.id }, data: { data: vendor } });
  return Response.json(vendor);
}
