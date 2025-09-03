export async function GET(_: Request, { params }: { params: { id: string } }) {
  return Response.json({ income: 1000, expenses: 500, net: 500, series: [] });
}
