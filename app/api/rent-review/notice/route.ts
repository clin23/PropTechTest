import { rentReviews } from '../../store';

export async function POST(req: Request) {
  const body = await req.json();
  const review = {
    ...body,
    noticeUrl: '/docs/rent-review-notice.pdf',
  };
  rentReviews.push(review);
  return Response.json(review);
}
