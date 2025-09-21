import {
  properties,
  tenants,
  incomes,
  expenses,
  documents,
  rentLedger,
  reminders,
  tenantNotes,
  tasks,
} from '../../../store';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const property = properties.find((p) => p.id === params.id);
  if (!property) return new Response('Not found', { status: 404 });

  const tenant = tenants.find((t) => t.propertyId === params.id) ?? null;
  const propertyTasks = tasks.filter((task) =>
    task.properties?.some((p) => p.id === params.id)
  );

  const data = {
    property,
    tenant,
    incomes: incomes.filter((income) => income.propertyId === params.id),
    expenses: expenses.filter((expense) => expense.propertyId === params.id),
    rentLedger: rentLedger.filter((entry) => entry.propertyId === params.id),
    documents: documents.filter((doc) => doc.propertyId === params.id),
    reminders: reminders.filter((reminder) => reminder.propertyId === params.id),
    tenantNotes: tenantNotes.filter((note) => note.propertyId === params.id),
    tasks: propertyTasks,
  };

  return Response.json(data);
}
