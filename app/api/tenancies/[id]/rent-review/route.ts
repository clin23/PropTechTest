export async function GET(_: Request, { params }: { params: { id: string } }) {
  return Response.json({ tenancyId: params.id, currentRent: 400 });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  return Response.json({ tenancyId: params.id, ...body, noticeUrl: '/docs/notice.pdf' });
}
