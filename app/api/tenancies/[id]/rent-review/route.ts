import { tenancies, rentReviews } from '../../../store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const tenancy = tenancies.find((t) => t.id === params.id);
  return Response.json({ tenancyId: tenancy?.id, currentRent: tenancy?.currentRent });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const tenancy = tenancies.find((t) => t.id === params.id);
  if (tenancy && body.newRent) tenancy.currentRent = body.newRent;
  const review = { tenancyId: params.id, ...body, noticeUrl: '/docs/notice.pdf' };
  rentReviews.push(review);
  return Response.json(review);
}
