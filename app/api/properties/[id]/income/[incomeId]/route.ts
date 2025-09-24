import { prisma } from '../../../../../../lib/prisma';
import {
  type IncomeRecord,
  removeLedgerForIncome,
  syncLedgerForIncome,
} from '../ledger';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; incomeId: string } }
) {
  const row = await prisma.mockData.findUnique({ where: { id: params.incomeId } });
  if (row && (row.data as any).propertyId === params.id) {
    return Response.json(row.data);
  }
  return Response.json(null);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; incomeId: string } }
) {
  const body = await req.json();
  const row = await prisma.mockData.findUnique({ where: { id: params.incomeId } });
  if (!row || (row.data as any).propertyId !== params.id) {
    return Response.json(null);
  }
  const data = { ...row.data, ...body } as any;
  if (Object.prototype.hasOwnProperty.call(body, "evidenceUrl")) {
    if (body.evidenceUrl == null || body.evidenceUrl === "") {
      delete data.evidenceUrl;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "evidenceName")) {
    if (body.evidenceName == null || body.evidenceName === "") {
      delete data.evidenceName;
    }
  }
  await prisma.mockData.update({
    where: { id: params.incomeId },
    data: { data },
  });
  await syncLedgerForIncome(data as IncomeRecord, row.data as IncomeRecord);
  return Response.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; incomeId: string } }
) {
  const row = await prisma.mockData.findUnique({ where: { id: params.incomeId } });
  if (!row || (row.data as any).propertyId !== params.id) {
    return new Response(null, { status: 404 });
  }
  await removeLedgerForIncome(row.data as IncomeRecord);
  await prisma.mockData.delete({ where: { id: params.incomeId } });
  return new Response(null, { status: 204 });
}
