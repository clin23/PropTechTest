import { NextResponse } from 'next/server';
import { expenses } from '../store';
import { expenseSchema } from '../../../lib/validation';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let results = expenses;
  const propertyId = searchParams.get('propertyId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const category = searchParams.get('category');
  const vendor = searchParams.get('vendor');

  if (propertyId) {
    results = results.filter((e) => e.propertyId === propertyId);
  }
  if (from) {
    results = results.filter((e) => new Date(e.date) >= new Date(from));
  }
  if (to) {
    results = results.filter((e) => new Date(e.date) <= new Date(to));
  }
  if (category) {
    results = results.filter((e) =>
      e.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  if (vendor) {
    results = results.filter((e) =>
      e.vendor.toLowerCase().includes(vendor.toLowerCase())
    );
  }
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = expenseSchema.parse(body);
    const newExpense = { id: `exp${expenses.length + 1}`, ...parsed };
    expenses.push(newExpense);
    return NextResponse.json(newExpense, { status: 201 });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 400 });
  }
}
