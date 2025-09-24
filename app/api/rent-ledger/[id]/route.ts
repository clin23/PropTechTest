import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const zPatch = z.object({
  amount: z.number().optional(),
  date: z.string().optional(),
  status: z.enum(["paid", "unpaid", "follow_up"]).optional(),
  evidenceUrl: z.string().optional().nullable(),
  evidenceName: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = zPatch.parse(await req.json());
    const rec = await prisma.mockData.findUnique({ where: { id: params.id } });
    if (!rec) return new Response('Not found', { status: 404 });
    const data: any = rec.data;
    if (body.amount !== undefined) {
      data.amount = body.amount;
    }
    if (body.date) {
      data.dueDate = body.date;
    }
    if (body.status) {
      data.status = body.status;
    }
    if (body.evidenceUrl !== undefined) {
      if (body.evidenceUrl) {
        data.evidenceUrl = body.evidenceUrl;
      } else {
        delete data.evidenceUrl;
      }
    }
    if (body.evidenceName !== undefined) {
      if (body.evidenceName) {
        data.evidenceName = body.evidenceName;
      } else {
        delete data.evidenceName;
      }
    }
    if (data.status === 'paid') {
      data.paidDate = body.date ?? data.dueDate;
    } else if (data.paidDate) {
      delete data.paidDate;
    }
    await prisma.mockData.update({ where: { id: params.id }, data: { data } });
    return Response.json({ id: params.id });
  } catch (err: any) {
    return new Response(err.message, { status: 400 });
  }
}
