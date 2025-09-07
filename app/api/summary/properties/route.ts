export async function GET() {
  return Response.json([
    {
      id: '1',
      address: '123 Main St',
      tenantName: 'Alice',
      rentStatus: 'Paid',
      nextKeyDate: '2024-07-01',
    },
    {
      id: '2',
      address: '456 Oak Ave',
      tenantName: 'Bob',
      rentStatus: 'Due',
      nextKeyDate: '2024-06-15',
    },
    {
      id: '3',
      address: '789 Pine Rd',
      tenantName: 'Carol',
      rentStatus: 'Paid',
      nextKeyDate: '2024-08-20',
    },
  ]);
}
