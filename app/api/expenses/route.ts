import { NextResponse } from 'next/server';
import { expenses } from '../store';
import { expenseSchema } from '../../../lib/validation';
import { prisma } from '../../../lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const category = searchParams.get('category');
  const vendor = searchParams.get('vendor');

  let results;
  if (process.env.MOCK_MODE === 'true') {
    results = expenses;
  } else {
    const records = await (prisma as any).mockData.findMany({
      where: { type: 'expense' },
    });
    results = records.map((r: any) => r.data);
  }

  if (propertyId) {
    results = results.filter((e: any) => e.propertyId === propertyId);
  }
  if (from) {
    results = results.filter(
      (e: any) => new Date(e.date) >= new Date(from)
    );
  }
  if (to) {
    results = results.filter(
      (e: any) => new Date(e.date) <= new Date(to)
    );
  }
  if (category) {
    results = results.filter((e: any) =>
      e.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  if (vendor) {
    results = results.filter((e: any) =>
      e.vendor.toLowerCase().includes(vendor.toLowerCase())
    );
  }
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = expenseSchema.parse(body);
    const newExpense = { id: randomUUID(), ...parsed };
    if (process.env.MOCK_MODE === 'true') {
      expenses.push(newExpense);
    } else {
      await (prisma as any).mockData.create({
        data: { id: newExpense.id, type: 'expense', data: newExpense },
      });
    }
    return NextResponse.json(newExpense, { status: 201 });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 400 });
  }
}
