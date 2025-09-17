import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const userId = randomUUID();
  const propertyId = 'property1';
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
      address_line1: '123 Main St',
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
      due_date: new Date('2025-09-01'),
      status: 'DUE'
    }
  });

  // mock data for API
  await prisma.mockData.create({
    data: { id: propertyId, type: 'property', data: { id: propertyId, address: '123 Main St' } }
  });
  await prisma.mockData.create({
    data: { id: 'rem1', type: 'reminder', data: { id: 'rem1', propertyId, message: 'Lease expiring soon' } }
  });
  await prisma.mockData.create({
    data: { id: 'rem2', type: 'reminder', data: { id: 'rem2', propertyId, message: 'Rent review due' } }
  });
  await prisma.mockData.create({
    data: { id: 'rem3', type: 'reminder', data: { id: 'rem3', propertyId, message: 'Insurance renewal' } }
  });
  await prisma.mockData.create({
    data: { id: 'notif1', type: 'notification', data: { id: 'notif1', propertyId, type: 'rentLate', message: 'Rent is late' } }
  });

  // sample expenses and income
  const expenseSeed = [
    {
      id: 'exp-2025-09-14-smoke-alarm',
      date: '2025-09-14',
      category: 'Smoke alarm service',
      vendor: 'SafeHome Compliance',
      amount: 110,
      gst: 10,
      notes: 'Annual smoke alarm service and certification',
    },
    {
      id: 'exp-2025-09-12-plumbing',
      date: '2025-09-12',
      category: 'Plumbing',
      vendor: 'Rapid Plumbing Co.',
      amount: 240,
      gst: 24,
      notes: 'Repair leaking ensuite tap',
    },
    {
      id: 'exp-2025-09-05-gardening',
      date: '2025-09-05',
      category: 'Gardening & landscaping',
      vendor: 'GreenScape Maintenance',
      amount: 180,
      gst: 18,
      notes: 'Fortnightly garden tidy and hedge trim',
    },
    {
      id: 'exp-2025-08-28-water-rates',
      date: '2025-08-28',
      category: 'Water rates',
      vendor: 'Sydney Water',
      amount: 320,
      gst: 0,
    },
    {
      id: 'exp-2025-08-22-general-repairs',
      date: '2025-08-22',
      category: 'General repairs',
      vendor: 'HandyFix Services',
      amount: 275,
      gst: 27.5,
      notes: 'Patio door alignment and lock adjustment',
    },
    {
      id: 'exp-2025-08-15-electricity',
      date: '2025-08-15',
      category: 'Electricity',
      vendor: 'EnergyCo Retail',
      amount: 210,
      gst: 21,
    },
    {
      id: 'exp-2025-08-01-insurance',
      date: '2025-08-01',
      category: 'Landlord insurance',
      vendor: 'SafeHome Insurance',
      amount: 480,
      gst: 48,
      notes: 'Annual landlord policy renewal',
    },
    {
      id: 'exp-2025-07-25-strata-admin',
      date: '2025-07-25',
      category: 'Strata – admin fund',
      vendor: 'Parramatta Strata Group',
      amount: 600,
      gst: 0,
    },
    {
      id: 'exp-2025-07-18-pest-control',
      date: '2025-07-18',
      category: 'Pest control',
      vendor: 'SureShield Pest Control',
      amount: 165,
      gst: 16.5,
      notes: 'Quarterly general pest treatment',
    },
  ];

  for (const expense of expenseSeed) {
    await prisma.mockData.create({
      data: {
        id: expense.id,
        type: 'expense',
        data: { propertyId, ...expense },
      },
    });
  }

  const incomeSeed = [
    {
      id: 'inc-2025-09-16-rent',
      tenantId,
      date: '2025-09-16',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-09-09-rent',
      tenantId,
      date: '2025-09-09',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-09-02-rent',
      tenantId,
      date: '2025-09-02',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-09-02-utilities',
      tenantId,
      date: '2025-09-02',
      category: 'Utilities reimbursement',
      amount: 92,
      notes: 'Water usage reimbursement',
    },
    {
      id: 'inc-2025-08-26-rent',
      tenantId,
      date: '2025-08-26',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-08-21-late-fee',
      tenantId,
      date: '2025-08-21',
      category: 'Late fee',
      amount: 45,
      notes: 'Charged after rent cleared two days late',
    },
    {
      id: 'inc-2025-08-19-rent',
      tenantId,
      date: '2025-08-19',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-08-12-rent',
      tenantId,
      date: '2025-08-12',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-08-05-rent',
      tenantId,
      date: '2025-08-05',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-07-29-rent',
      tenantId,
      date: '2025-07-29',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-07-22-rent',
      tenantId,
      date: '2025-07-22',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
    {
      id: 'inc-2025-07-16-rent',
      tenantId,
      date: '2025-07-16',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
    },
  ];

  for (const income of incomeSeed) {
    await prisma.mockData.create({
      data: {
        id: income.id,
        type: 'income',
        data: { propertyId, ...income },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

