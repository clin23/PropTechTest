export async function GET() {
  return Response.json([
    { id: '1', address: '123 Main St', tenant: 'Alice', rentStatus: 'Paid', leaseExpiry: '2024-12-31', monthlyRent: 2000 },
    { id: '2', address: '456 Oak Ave', tenant: 'Bob', rentStatus: 'Due', leaseExpiry: '2025-03-15', monthlyRent: 1800 },
    { id: '3', address: '789 Pine Rd', tenant: 'Carol', rentStatus: 'Paid', leaseExpiry: '2024-09-30', monthlyRent: 2200 },
  ]);
}
