import { NextResponse } from 'next/server';

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file');
  const name = typeof file === 'object' && 'name' in file ? (file as File).name : '';
  const base = name.replace(/\.[^/.]+$/, '');
  const parts = base.split(/[-_]/).filter(Boolean);

  let date = parts.find((p) => /^\d{4}-\d{2}-\d{2}$/.test(p) || /^\d{8}$/.test(p));
  if (date && /^\d{8}$/.test(date)) {
    date = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6)}`;
  }
  const amountStr = parts.find((p) => /^\d+(?:\.\d+)?$/.test(p));
  const amount = amountStr ? parseFloat(amountStr) : 0;
  const words = parts.filter((p) => isNaN(parseFloat(p)) && p !== date);
  const vendor = words[0] ? capitalize(words[0]) : 'Vendor';
  const category = words[1] ? capitalize(words[1]) : 'General';
  const notes = base.replace(/[-_]/g, ' ');

  return NextResponse.json({
    date: date || '2024-01-01',
    amount,
    category,
    vendor,
    notes,
  });
}

