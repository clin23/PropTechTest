import { applications } from '../store';

export async function GET() {
  return Response.json(applications);
}

export async function POST(req: Request) {
  const body = await req.json();
  const app = { id: String(applications.length + 1), ...body };
  applications.push(app);
  return Response.json(app);
}
