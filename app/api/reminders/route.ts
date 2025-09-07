import { reminders } from '../store';

export async function GET() {
  return Response.json(reminders);
}
