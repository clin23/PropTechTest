export async function GET() {
  return Response.json({ monthIncome: 5000, monthExpenses: 2500, net: 2500 });
}
