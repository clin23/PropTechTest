import { applications } from '../store';

export async function GET() {
  return Response.json(applications);
}
