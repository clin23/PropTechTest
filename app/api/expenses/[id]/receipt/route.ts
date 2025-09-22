import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { expenses } from '../../../store';
import { prisma } from '../../../../../lib/prisma';

const MAX_RECEIPT_MB = Number(process.env.MAX_UPLOAD_MB ?? 5);
const ALLOWED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const form = await req.formData();
    const file = form.get('receipt');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Receipt file is required' }, { status: 400 });
    }

    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_RECEIPT_MB) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const filename = `${params.id}-${randomUUID()}${extension}`;
    const dir = join(process.cwd(), 'public', 'uploads', 'receipts');

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);

    const url = `/uploads/receipts/${filename}`;

    if (process.env.MOCK_MODE === 'true') {
      const expense = expenses.find((e) => e.id === params.id);
      if (!expense) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      expense.receiptUrl = url;
    } else {
      const record = await (prisma as any).mockData.findUnique({ where: { id: params.id } });
      if (!record || record.type !== 'expense') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      const data = { ...record.data, receiptUrl: url };
      await (prisma as any).mockData.update({
        where: { id: params.id },
        data: { data },
      });
    }

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid multipart payload' }, { status: 400 });
  }
}
