import { randomUUID } from 'crypto';
import { prisma } from '../../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const tenancy = await prisma.mockData.findUnique({ where: { id: params.id } });
  const data: any = tenancy?.data;
  return Response.json({ tenancyId: tenancy?.id, currentRent: data?.currentRent });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const tenancyRow = await prisma.mockData.findUnique({ where: { id: params.id } });
  if (tenancyRow && body.newRent) {
    const data = { ...(tenancyRow.data as any), currentRent: body.newRent };
    await prisma.mockData.update({ where: { id: params.id }, data: { data } });
  }
  const review = { id: randomUUID(), tenancyId: params.id, ...body, noticeUrl: '/docs/notice.pdf' };
  await prisma.mockData.create({ data: { id: review.id, type: 'rentReview', data: review } });
  return Response.json(review);
}
