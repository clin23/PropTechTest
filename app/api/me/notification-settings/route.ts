import { notificationSettings } from '../../store';

export async function GET() {
  return Response.json(notificationSettings);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  Object.assign(notificationSettings, body);
  return Response.json(notificationSettings);
}
