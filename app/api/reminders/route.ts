export async function GET() {
  return Response.json([
    { id: 'r1', title: 'Rent review for 123 Main St', date: '2024-06-15' },
    { id: 'r2', title: 'Lease expiry for 456 Oak Ave', date: '2024-08-01' },
    { id: 'r3', title: 'Insurance renewal for 789 Pine Rd', date: '2024-07-20' }
  ]);
}
