let expenses = [
  { id: 'e1', propertyId: '1', amount: 500, date: '2024-05-01', description: 'Repairs' },
  { id: 'e2', propertyId: '2', amount: 300, date: '2024-05-10', description: 'Maintenance' }
];

export async function GET() {
  return Response.json(expenses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newExpense = { id: `e${expenses.length + 1}`, ...body };
  expenses.push(newExpense);
  return Response.json(newExpense);
}
