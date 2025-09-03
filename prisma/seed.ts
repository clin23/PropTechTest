import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const userId = randomUUID();
  const propertyId = randomUUID();
  const tenantId = randomUUID();
  const tenancyId = randomUUID();
  const paymentId = randomUUID();
  const job1Id = randomUUID();
  const job2Id = randomUUID();
  const complianceId = randomUUID();

  await prisma.user.create({
    data: { id: userId, name: 'Ava Owner', email: 'ava@example.com' }
  });

  await prisma.property.create({
    data: {
      id: propertyId,
      ownerUserId: userId,
      address_line1: '10 Rose St',
      suburb: 'Parramatta',
      state: 'NSW',
      postcode: '2150'
    }
  });

  await prisma.tenant.create({
    data: {
      id: tenantId,
      first_name: 'Liam',
      last_name: 'Tenant',
      email: 'liam@example.com'
    }
  });

  await prisma.tenancy.create({
    data: {
      id: tenancyId,
      propertyId,
      primaryTenantId: tenantId,
      start_date: new Date('2025-07-01'),
      rent_amount: '650.00',
      rent_frequency: 'WEEKLY',
      status: 'ACTIVE'
    }
  });

  await prisma.payment.create({
    data: {
      id: paymentId,
      tenancyId,
      date_received: new Date('2025-08-25'),
      amount: '650.00',
      method: 'BANK_TRANSFER'
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: job1Id,
      propertyId,
      tenancyId,
      createdByUserId: userId,
      title: 'Leaking tap',
      priority: 'URGENT',
      status: 'IN_PROGRESS'
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: job2Id,
      propertyId,
      createdByUserId: userId,
      title: 'Loose fence panel',
      priority: 'NORMAL',
      status: 'SUBMITTED'
    }
  });

  await prisma.complianceItem.create({
    data: {
      id: complianceId,
      propertyId,
      type: 'SMOKE_ALARM',
      due_date: new Date('2025-09-15'),
      status: 'DUE'
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

