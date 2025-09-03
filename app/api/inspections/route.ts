import { inspections } from '../store';

export async function GET() {
  return Response.json(inspections);
}

export async function POST(req: Request) {
  const body = await req.json();
  const inspection = { id: String(inspections.length + 1), ...body };
  inspections.push(inspection);
  return Response.json(inspection);
}
