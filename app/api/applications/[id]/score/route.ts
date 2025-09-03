export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  return Response.json({ id: params.id, ...body });
}
