import { randomUUID } from 'crypto';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const review = {
    id: randomUUID(),
    ...body,
    noticeUrl: '/docs/rent-review-notice.pdf',
  };
  await prisma.mockData.create({ data: { id: review.id, type: 'rentReview', data: review } });
  return Response.json(review);
}
