import { randomUUID } from 'crypto';
import { uploads } from '../store';

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 5;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'File is required' }, { status: 400 });
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return Response.json({ error: 'Invalid file type' }, { status: 400 });
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_UPLOAD_MB) {
      return Response.json({ error: 'File too large' }, { status: 400 });
    }
    const url = `/uploads/${randomUUID()}`;
    uploads.push(url);
    return Response.json({ url });
  } catch {
    return Response.json({ error: 'Invalid multipart payload' }, { status: 400 });
  }
}
