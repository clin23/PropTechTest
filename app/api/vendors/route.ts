import { vendors } from '../store';

export async function GET() {
  return Response.json(vendors);
}

export async function POST(req: Request) {
  const body = await req.json();
  const vendor = {
    id: String(vendors.length + 1),
    insured: false,
    licensed: false,
    avgResponseTime: undefined,
    documents: [],
    ...body,
  };
  vendors.push(vendor);
  return Response.json(vendor);
}
