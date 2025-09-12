import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const zPatch = z.object({
  amount: z.number().optional(),
  date: z.string().optional(),
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
      if (data.status === 'paid') {
        data.paidDate = body.date;
      }
    }
    await prisma.mockData.update({ where: { id: params.id }, data: { data } });
    return Response.json({ id: params.id });
  } catch (err: any) {
    return new Response(err.message, { status: 400 });
  }
}
