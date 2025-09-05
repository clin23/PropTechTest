export async function POST(req: Request) {
  const type = req.headers.get('content-type') || '';
  if (type.includes('multipart/form-data')) {
    await req.formData();
    return Response.json({ ok: true });
  }
  const body = await req.json();
  return Response.json({ ok: true, ...body });
}
