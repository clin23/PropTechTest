import { vendors } from '../../store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { url } = await req.json();
  const vendor = vendors.find((v) => v.id === params.id);
  if (vendor) {
    vendor.documents = vendor.documents || [];
    vendor.documents.push(url);
  }
  return Response.json(vendor);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { url } = await req.json();
  const vendor = vendors.find((v) => v.id === params.id);
  if (vendor && vendor.documents) {
    vendor.documents = vendor.documents.filter((d: string) => d !== url);
  }
  return Response.json(vendor);
}
