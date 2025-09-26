import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const userId = randomUUID();
  const propertyId = 'property1';
  const property2Id = 'property2';
  const tenantId = randomUUID();
  const tenant2Id = randomUUID();
  const tenancyId = randomUUID();
  const tenancy2Id = randomUUID();
  const paymentId = randomUUID();
  const paymentSept02Id = randomUUID();
  const paymentSept09Id = randomUUID();
  const paymentSept16Id = randomUUID();
  const paymentSept23Id = randomUUID();
  const paymentOakSept01Id = randomUUID();
  const paymentOakSept07Id = randomUUID();
  const paymentOakSept08Id = randomUUID();
  const paymentOakSept15Id = randomUUID();
  const paymentOakSept23Id = randomUUID();
  const job1Id = randomUUID();
  const job2Id = randomUUID();
  const job3Id = randomUUID();
  const jobOak1Id = randomUUID();
  const jobOak2Id = randomUUID();
  const jobOak3Id = randomUUID();
  const complianceSmokeId = randomUUID();
  const complianceInspectionId = randomUUID();
  const complianceInsuranceId = randomUUID();
  const compliancePoolId = randomUUID();
  const complianceOakSmokeId = randomUUID();
  const complianceOakInspectionId = randomUUID();
  const complianceOakInsuranceId = randomUUID();
  const complianceOakPoolId = randomUUID();

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

  await prisma.property.create({
    data: {
      id: property2Id,
      ownerUserId: userId,
      address_line1: '456 Oak Ave',
      suburb: 'Harris Park',
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

  await prisma.tenant.create({
    data: {
      id: tenant2Id,
      first_name: 'Bob',
      last_name: 'Renter',
      email: 'bob.renter@example.com'
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

  await prisma.tenancy.create({
    data: {
      id: tenancy2Id,
      propertyId: property2Id,
      primaryTenantId: tenant2Id,
      start_date: new Date('2025-04-01'),
      rent_amount: '475.00',
      rent_frequency: 'WEEKLY',
      status: 'ACTIVE'
    }
  });

  const paymentSeed = [
    {
      id: paymentId,
      tenancyId,
      date: '2025-08-25',
      amount: '650.00',
      method: 'BANK_TRANSFER',
      reference: 'Wk9 rent',
      notes: 'Rent payment received on time.',
    },
    {
      id: paymentSept02Id,
      tenancyId,
      date: '2025-09-02',
      amount: '650.00',
      method: 'BANK_TRANSFER',
      reference: 'Wk10 rent',
      notes: 'Rent covering 1-7 September.',
    },
    {
      id: paymentSept09Id,
      tenancyId,
      date: '2025-09-09',
      amount: '650.00',
      method: 'CARD',
      reference: 'Wk11 rent',
      notes: 'Paid via owner portal card payment.',
    },
    {
      id: paymentSept16Id,
      tenancyId,
      date: '2025-09-16',
      amount: '650.00',
      method: 'BANK_TRANSFER',
      reference: 'Wk12 rent',
      notes: 'Includes confirmation of rent increase.',
    },
    {
      id: paymentSept23Id,
      tenancyId,
      date: '2025-09-23',
      amount: '650.00',
      method: 'CASH',
      reference: 'Wk13 rent',
      notes: 'Processed by agency front desk after tenant visit.',
    },
    {
      id: paymentOakSept01Id,
      tenancyId: tenancy2Id,
      date: '2025-09-01',
      amount: '475.00',
      method: 'BANK_TRANSFER',
      reference: 'Oak Wk1 rent',
      notes: 'Fortnight 1 rent from Bob Renter.',
    },
    {
      id: paymentOakSept07Id,
      tenancyId: tenancy2Id,
      date: '2025-09-07',
      amount: '180.00',
      method: 'CARD',
      reference: 'Oak arrears catch-up',
      notes: 'Cleared August rent shortfall.',
    },
    {
      id: paymentOakSept08Id,
      tenancyId: tenancy2Id,
      date: '2025-09-08',
      amount: '475.00',
      method: 'BANK_TRANSFER',
      reference: 'Oak Wk2 rent',
      notes: 'Rent received ahead of scheduled date.',
    },
    {
      id: paymentOakSept15Id,
      tenancyId: tenancy2Id,
      date: '2025-09-15',
      amount: '475.00',
      method: 'BANK_TRANSFER',
      reference: 'Oak Wk3 rent',
      notes: 'Tenant paid via recurring transfer.',
    },
    {
      id: paymentOakSept23Id,
      tenancyId: tenancy2Id,
      date: '2025-09-23',
      amount: '475.00',
      method: 'BANK_TRANSFER',
      reference: 'Oak Wk4 rent',
      notes: 'Rent processed by agency trust account.',
    },
  ];

  for (const payment of paymentSeed) {
    const { tenancyId: paymentTenancyId = tenancyId, date, ...paymentData } = payment;
    await prisma.payment.create({
      data: {
        tenancyId: paymentTenancyId,
        ...paymentData,
        date_received: new Date(date),
      },
    });
  }

  await prisma.maintenanceJob.create({
    data: {
      id: job1Id,
      propertyId,
      tenancyId,
      createdByUserId: userId,
      title: 'Leaking tap',
      description:
        'Tenant reported a constant drip from the ensuite basin. Replace washer and check water pressure.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      due_date: new Date('2025-09-03'),
      spend_cap: '300.00'
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: job2Id,
      propertyId,
      createdByUserId: userId,
      title: 'Loose fence panel',
      description:
        'North boundary fence panel rattles in high winds. Arrange carpenter to secure posts.',
      priority: 'NORMAL',
      status: 'SUBMITTED',
      due_date: new Date('2025-09-12')
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: job3Id,
      propertyId,
      tenancyId,
      createdByUserId: userId,
      title: 'Spring gutter clean',
      description:
        'Book external cleaner to clear roof gutters before storm season and photograph completion.',
      priority: 'NORMAL',
      status: 'APPROVED',
      due_date: new Date('2025-09-18'),
      spend_cap: '450.00'
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: jobOak1Id,
      propertyId: property2Id,
      tenancyId: tenancy2Id,
      createdByUserId: userId,
      title: 'Oak Ave dishwasher repair',
      description:
        'Tenant reported dishwasher not draining; engage technician to service pump and hoses.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      due_date: new Date('2025-09-07'),
      spend_cap: '380.00'
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: jobOak2Id,
      propertyId: property2Id,
      createdByUserId: userId,
      title: 'Oak Ave hedge trim',
      description:
        'Arrange gardener to trim boundary hedges ahead of spring bloom and remove green waste.',
      priority: 'NORMAL',
      status: 'SUBMITTED',
      due_date: new Date('2025-09-12')
    }
  });

  await prisma.maintenanceJob.create({
    data: {
      id: jobOak3Id,
      propertyId: property2Id,
      tenancyId: tenancy2Id,
      createdByUserId: userId,
      title: 'Pool compliance service',
      description:
        'Schedule pool technician to balance chemicals and ensure barrier compliance prior to summer.',
      priority: 'NORMAL',
      status: 'APPROVED',
      due_date: new Date('2025-09-16'),
      spend_cap: '320.00'
    }
  });

  await prisma.complianceItem.create({
    data: {
      id: complianceSmokeId,
      propertyId,
      type: 'SMOKE_ALARM',
      due_date: new Date('2025-09-01'),
      status: 'DUE'
    }
  });
  await prisma.complianceItem.create({
    data: {
      id: complianceInspectionId,
      propertyId,
      type: 'ROUTINE_INSPECTION',
      due_date: new Date('2025-09-10'),
      status: 'DUE'
    }
  });
  await prisma.complianceItem.create({
    data: {
      id: complianceInsuranceId,
      propertyId,
      type: 'INSURANCE_RENEWAL',
      due_date: new Date('2025-09-15'),
      status: 'DUE'
    }
  });
  await prisma.complianceItem.create({
    data: {
      id: compliancePoolId,
      propertyId,
      type: 'POOL_CERT',
      due_date: new Date('2025-09-22'),
      status: 'OK'
    }
  });

  await prisma.complianceItem.create({
    data: {
      id: complianceOakSmokeId,
      propertyId: property2Id,
      type: 'SMOKE_ALARM',
      due_date: new Date('2025-09-05'),
      status: 'DUE'
    }
  });
  await prisma.complianceItem.create({
    data: {
      id: complianceOakInspectionId,
      propertyId: property2Id,
      type: 'ROUTINE_INSPECTION',
      due_date: new Date('2025-09-14'),
      status: 'SCHEDULED'
    }
  });
  await prisma.complianceItem.create({
    data: {
      id: complianceOakInsuranceId,
      propertyId: property2Id,
      type: 'INSURANCE_RENEWAL',
      due_date: new Date('2025-09-18'),
      status: 'DUE'
    }
  });
  await prisma.complianceItem.create({
    data: {
      id: complianceOakPoolId,
      propertyId: property2Id,
      type: 'POOL_CERT',
      due_date: new Date('2025-09-24'),
      status: 'OK'
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
  await prisma.mockData.create({
    data: { id: property2Id, type: 'property', data: { id: property2Id, address: '456 Oak Ave' } }
  });
  await prisma.mockData.create({
    data: {
      id: 'rem-oak1',
      type: 'reminder',
      data: { id: 'rem-oak1', propertyId: property2Id, message: 'Pool service scheduled' },
    },
  });
  await prisma.mockData.create({
    data: {
      id: 'rem-oak2',
      type: 'reminder',
      data: { id: 'rem-oak2', propertyId: property2Id, message: 'Routine inspection' },
    },
  });
  await prisma.mockData.create({
    data: {
      id: 'rem-oak3',
      type: 'reminder',
      data: { id: 'rem-oak3', propertyId: property2Id, message: 'Insurance review' },
    },
  });
  await prisma.mockData.create({
    data: {
      id: 'notif-oak1',
      type: 'notification',
      data: { id: 'notif-oak1', propertyId: property2Id, type: 'rentReceived', message: 'Oak Ave rent received' },
    },
  });

  // sample expenses and income
  const expenseSeed = [
    {
      id: 'exp-2025-09-01-council-rates',
      date: '2025-09-01',
      category: 'Council rates',
      vendor: 'City of Parramatta',
      amount: 450,
      gst: 0,
      notes: 'Quarterly council rates notice covering September billing period.',
      receiptUrl: 'https://example.com/receipts/2025-09-01-council-rates.pdf',
      label: 'Council rates Q3',
    },
    {
      id: 'exp-2025-09-02-general-repairs',
      date: '2025-09-02',
      category: 'General repairs',
      vendor: 'HandyFix Services',
      amount: 285,
      gst: 28.5,
      notes: 'Replaced ensuite tap washer and tested for leaks.',
      receiptUrl: 'https://example.com/receipts/2025-09-02-general-repairs.pdf',
      label: 'Ensuite repair',
    },
    {
      id: 'exp-2025-09-03-gardening',
      date: '2025-09-03',
      category: 'Gardening & landscaping',
      vendor: 'GreenScape Maintenance',
      amount: 195,
      gst: 19.5,
      notes: 'Full garden tidy, edging and mulch top up.',
      receiptUrl: 'https://example.com/receipts/2025-09-03-gardening.pdf',
    },
    {
      id: 'exp-2025-09-04-electrical',
      date: '2025-09-04',
      category: 'Electrical',
      vendor: 'BrightSpark Electrical',
      amount: 165,
      gst: 16.5,
      notes: 'Replaced hallway downlight transformers and issued certificate.',
      receiptUrl: 'https://example.com/receipts/2025-09-04-electrical.pdf',
      label: 'Lighting maintenance',
    },
    {
      id: 'exp-2025-09-05-gardening',
      date: '2025-09-05',
      category: 'Gardening & landscaping',
      vendor: 'GreenScape Maintenance',
      amount: 180,
      gst: 18,
      notes: 'Fortnightly garden tidy and hedge trim',
      receiptUrl: 'https://example.com/receipts/2025-09-05-gardening.pdf',
    },
    {
      id: 'exp-2025-09-06-plumbing',
      date: '2025-09-06',
      category: 'Plumbing',
      vendor: 'Rapid Plumbing Co.',
      amount: 210,
      gst: 21,
      notes: 'Cleared kitchen sink slow drain and resealed trap.',
      receiptUrl: 'https://example.com/receipts/2025-09-06-plumbing.pdf',
    },
    {
      id: 'exp-2025-09-07-pest-control',
      date: '2025-09-07',
      category: 'Pest control',
      vendor: 'SureShield Pest Control',
      amount: 175,
      gst: 17.5,
      notes: 'Targeted ant treatment in courtyard.',
      receiptUrl: 'https://example.com/receipts/2025-09-07-pest.pdf',
    },
    {
      id: 'exp-2025-09-08-water-rates',
      date: '2025-09-08',
      category: 'Water rates',
      vendor: 'Sydney Water',
      amount: 335,
      gst: 0,
      notes: 'Quarterly water usage invoice including service charges.',
      receiptUrl: 'https://example.com/receipts/2025-09-08-water.pdf',
    },
    {
      id: 'exp-2025-09-09-internet',
      date: '2025-09-09',
      category: 'Internet/phone',
      vendor: 'TelcoFast',
      amount: 89,
      gst: 8.9,
      notes: 'Internet connection for smart home monitoring.',
      receiptUrl: 'https://example.com/receipts/2025-09-09-internet.pdf',
    },
    {
      id: 'exp-2025-09-10-management-fees',
      date: '2025-09-10',
      category: 'Property management fees',
      vendor: 'PropTech Management',
      amount: 220,
      gst: 22,
      notes: 'Monthly property management service fee.',
      receiptUrl: 'https://example.com/receipts/2025-09-10-management.pdf',
      label: 'Management fee',
    },
    {
      id: 'exp-2025-09-11-accounting',
      date: '2025-09-11',
      category: 'Accounting & bookkeeping',
      vendor: 'Ledger & Co Accountants',
      amount: 145,
      gst: 14.5,
      notes: 'Processing landlord quarterly BAS lodgement.',
      receiptUrl: 'https://example.com/receipts/2025-09-11-accounting.pdf',
    },
    {
      id: 'exp-2025-09-12-plumbing',
      date: '2025-09-12',
      category: 'Plumbing',
      vendor: 'Rapid Plumbing Co.',
      amount: 240,
      gst: 24,
      notes: 'Repair leaking ensuite tap',
      receiptUrl: 'https://example.com/receipts/2025-09-12-plumbing.pdf',
    },
    {
      id: 'exp-2025-09-13-mortgage',
      date: '2025-09-13',
      category: 'Mortgage interest',
      vendor: 'HomeBank Lending',
      amount: 1235,
      gst: 0,
      notes: 'Monthly interest charge on investment loan.',
      receiptUrl: 'https://example.com/receipts/2025-09-13-mortgage.pdf',
      label: 'Loan interest',
    },
    {
      id: 'exp-2025-09-14-smoke-alarm',
      date: '2025-09-14',
      category: 'Smoke alarm service',
      vendor: 'SafeHome Compliance',
      amount: 110,
      gst: 10,
      notes: 'Annual smoke alarm service and certification',
      receiptUrl: 'https://example.com/receipts/2025-09-14-smoke.pdf',
    },
    {
      id: 'exp-2025-09-15-electrical-safety',
      date: '2025-09-15',
      category: 'Electrical safety check',
      vendor: 'SafeSwitch Electrical',
      amount: 198,
      gst: 19.8,
      notes: 'Annual electrical safety compliance inspection.',
      receiptUrl: 'https://example.com/receipts/2025-09-15-electrical-safety.pdf',
    },
    {
      id: 'exp-2025-09-16-gas-safety',
      date: '2025-09-16',
      category: 'Gas safety check',
      vendor: 'GasGuard Services',
      amount: 205,
      gst: 20.5,
      notes: 'Gas appliance safety check and flue test.',
      receiptUrl: 'https://example.com/receipts/2025-09-16-gas.pdf',
    },
    {
      id: 'exp-2025-09-17-pool-cert',
      date: '2025-09-17',
      category: 'Pool safety certificate',
      vendor: 'AquaCert Inspectors',
      amount: 260,
      gst: 26,
      notes: 'Pool safety certification renewal visit.',
      receiptUrl: 'https://example.com/receipts/2025-09-17-pool.pdf',
    },
    {
      id: 'exp-2025-09-18-appliance-service',
      date: '2025-09-18',
      category: 'Appliance service/repair',
      vendor: 'Appliance Pros',
      amount: 185,
      gst: 18.5,
      notes: 'Annual service of ducted air-conditioning unit.',
      receiptUrl: 'https://example.com/receipts/2025-09-18-appliance.pdf',
    },
    {
      id: 'exp-2025-09-19-rubbish',
      date: '2025-09-19',
      category: 'Rubbish removal',
      vendor: 'CleanCart Waste',
      amount: 95,
      gst: 9.5,
      notes: 'Removal of green waste after hedge trimming.',
      receiptUrl: 'https://example.com/receipts/2025-09-19-rubbish.pdf',
    },
    {
      id: 'exp-2025-09-20-capital-improvements',
      date: '2025-09-20',
      category: 'Capital improvements',
      vendor: 'Outdoor Living Co.',
      amount: 980,
      gst: 98,
      notes: 'Installed new composite decking boards on rear patio.',
      receiptUrl: 'https://example.com/receipts/2025-09-20-capital.pdf',
      label: 'Deck upgrade',
    },
    {
      id: 'exp-2025-09-21-depreciation-fixtures',
      date: '2025-09-21',
      category: 'Depreciation – fixtures & fittings',
      vendor: 'Asset Depreciation Services',
      amount: 410,
      gst: 41,
      notes: 'Quantity surveyor update for fixture depreciation schedule.',
      receiptUrl: 'https://example.com/receipts/2025-09-21-depreciation-fixtures.pdf',
    },
    {
      id: 'exp-2025-09-22-building-depreciation',
      date: '2025-09-22',
      category: 'Building depreciation',
      vendor: 'Asset Depreciation Services',
      amount: 390,
      gst: 39,
      notes: 'Building depreciation schedule update for FY25.',
      receiptUrl: 'https://example.com/receipts/2025-09-22-building-depreciation.pdf',
    },
    {
      id: 'exp-2025-09-23-legal-fees',
      date: '2025-09-23',
      category: 'Legal fees',
      vendor: 'Harbour Legal',
      amount: 260,
      gst: 26,
      notes: 'Lease renewal review and advice.',
      receiptUrl: 'https://example.com/receipts/2025-09-23-legal.pdf',
    },
    {
      id: 'exp-2025-09-24-postage',
      date: '2025-09-24',
      category: 'Postage/printing/stationery',
      vendor: 'Office Supplies Direct',
      amount: 38,
      gst: 3.8,
      notes: 'Postage and stationery for lease documents.',
      receiptUrl: 'https://example.com/receipts/2025-09-24-postage.pdf',
    },
    {
      id: 'exp-2025-09-25-misc',
      date: '2025-09-25',
      category: 'Miscellaneous',
      vendor: 'PropAssist Services',
      amount: 55,
      gst: 5.5,
      notes: 'Key cutting and lockbox replacement.',
      receiptUrl: 'https://example.com/receipts/2025-09-25-misc.pdf',
      label: 'Lockbox refresh',
    },
    {
      id: 'exp-2025-08-28-water-rates',
      date: '2025-08-28',
      category: 'Water rates',
      vendor: 'Sydney Water',
      amount: 320,
      gst: 0,
      receiptUrl: 'https://example.com/receipts/2025-08-28-water.pdf',
    },
    {
      id: 'exp-2025-08-22-general-repairs',
      date: '2025-08-22',
      category: 'General repairs',
      vendor: 'HandyFix Services',
      amount: 275,
      gst: 27.5,
      notes: 'Patio door alignment and lock adjustment',
      receiptUrl: 'https://example.com/receipts/2025-08-22-general-repairs.pdf',
    },
    {
      id: 'exp-2025-08-15-electricity',
      date: '2025-08-15',
      category: 'Electricity',
      vendor: 'EnergyCo Retail',
      amount: 210,
      gst: 21,
      receiptUrl: 'https://example.com/receipts/2025-08-15-electricity.pdf',
    },
    {
      id: 'exp-2025-08-01-insurance',
      date: '2025-08-01',
      category: 'Landlord insurance',
      vendor: 'SafeHome Insurance',
      amount: 480,
      gst: 48,
      notes: 'Annual landlord policy renewal',
      receiptUrl: 'https://example.com/receipts/2025-08-01-insurance.pdf',
    },
    {
      id: 'exp-2025-07-25-strata-admin',
      date: '2025-07-25',
      category: 'Strata – admin fund',
      vendor: 'Parramatta Strata Group',
      amount: 600,
      gst: 0,
      receiptUrl: 'https://example.com/receipts/2025-07-25-strata.pdf',
    },
    {
      id: 'exp-2025-07-18-pest-control',
      date: '2025-07-18',
      category: 'Pest control',
      vendor: 'SureShield Pest Control',
      amount: 165,
      gst: 16.5,
      notes: 'Quarterly general pest treatment',
      receiptUrl: 'https://example.com/receipts/2025-07-18-pest.pdf',
    },
    {
      id: 'exp-2025-09-01-oak-council',
      propertyId: property2Id,
      date: '2025-09-01',
      category: 'Council rates',
      vendor: 'Cumberland Council',
      amount: 410,
      gst: 0,
      notes: 'Quarterly council rates instalment for Oak Ave.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-01-council.pdf',
      label: 'Council rates Q3',
    },
    {
      id: 'exp-2025-09-02-oak-repairs',
      propertyId: property2Id,
      date: '2025-09-02',
      category: 'General repairs',
      vendor: 'Oakfield Maintenance',
      amount: 265,
      gst: 26.5,
      notes: 'Adjusted sticking laundry door and rehung hinges.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-02-repairs.pdf',
      label: 'Laundry door fix',
    },
    {
      id: 'exp-2025-09-03-oak-gardening',
      propertyId: property2Id,
      date: '2025-09-03',
      category: 'Gardening & landscaping',
      vendor: 'Hillside Gardeners',
      amount: 175,
      gst: 17.5,
      notes: 'Fortnightly mow, edge, and shrub trim service.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-03-gardening.pdf',
    },
    {
      id: 'exp-2025-09-04-oak-electrical',
      propertyId: property2Id,
      date: '2025-09-04',
      category: 'Electrical',
      vendor: 'SparkRight Electrical',
      amount: 195,
      gst: 19.5,
      notes: 'Replaced motion sensor light on side entry.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-04-electrical.pdf',
      label: 'Sensor light replacement',
    },
    {
      id: 'exp-2025-09-05-oak-cleaning',
      propertyId: property2Id,
      date: '2025-09-05',
      category: 'Cleaning',
      vendor: 'FreshNest Cleaning',
      amount: 140,
      gst: 14,
      notes: 'Deep clean after short-stay guest departure.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-05-cleaning.pdf',
    },
    {
      id: 'exp-2025-09-06-oak-pest',
      propertyId: property2Id,
      date: '2025-09-06',
      category: 'Pest control',
      vendor: 'Shield Pest Experts',
      amount: 165,
      gst: 16.5,
      notes: 'Spider treatment for garage and eaves.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-06-pest.pdf',
      label: 'Quarterly pest spray',
    },
    {
      id: 'exp-2025-09-07-oak-appliance',
      propertyId: property2Id,
      date: '2025-09-07',
      category: 'Appliance repair',
      vendor: 'Premium Appliance Care',
      amount: 320,
      gst: 32,
      notes: 'Repaired dishwasher drain pump and tested cycle.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-07-appliance.pdf',
    },
    {
      id: 'exp-2025-09-08-oak-water',
      propertyId: property2Id,
      date: '2025-09-08',
      category: 'Water rates',
      vendor: 'Sydney Water',
      amount: 310,
      gst: 0,
      notes: 'Quarterly water usage and service charges.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-08-water.pdf',
      label: 'Water invoice Q3',
    },
    {
      id: 'exp-2025-09-09-oak-internet',
      propertyId: property2Id,
      date: '2025-09-09',
      category: 'Internet/phone',
      vendor: 'MetroNet Fibre',
      amount: 85,
      gst: 8.5,
      notes: 'Wi-Fi service for smart irrigation controller.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-09-internet.pdf',
    },
    {
      id: 'exp-2025-09-10-oak-insurance',
      propertyId: property2Id,
      date: '2025-09-10',
      category: 'Landlord insurance',
      vendor: 'SecureHome Insurance',
      amount: 480,
      gst: 0,
      notes: 'Policy adjustment adding accidental damage cover.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-10-insurance.pdf',
      label: 'Policy rider update',
    },
    {
      id: 'exp-2025-09-11-oak-strata-admin',
      propertyId: property2Id,
      date: '2025-09-11',
      category: 'Strata – admin fund',
      vendor: 'Oakfield Strata Group',
      amount: 250,
      gst: 0,
      notes: 'September administrative levy.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-11-strata-admin.pdf',
    },
    {
      id: 'exp-2025-09-12-oak-waste',
      propertyId: property2Id,
      date: '2025-09-12',
      category: 'Waste removal',
      vendor: 'EcoWaste Services',
      amount: 95,
      gst: 9.5,
      notes: 'Green waste skip for garden pruning.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-12-waste.pdf',
    },
    {
      id: 'exp-2025-09-13-oak-hvac',
      propertyId: property2Id,
      date: '2025-09-13',
      category: 'HVAC maintenance',
      vendor: 'ClimateCare Technicians',
      amount: 275,
      gst: 27.5,
      notes: 'Bi-annual ducted aircon service and filter replacement.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-13-hvac.pdf',
      label: 'Spring HVAC service',
    },
    {
      id: 'exp-2025-09-14-oak-windows',
      propertyId: property2Id,
      date: '2025-09-14',
      category: 'Window cleaning',
      vendor: 'Crystal Clear Windows',
      amount: 145,
      gst: 14.5,
      notes: 'Interior and exterior window clean including skylights.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-14-windows.pdf',
    },
    {
      id: 'exp-2025-09-15-oak-tree',
      propertyId: property2Id,
      date: '2025-09-15',
      category: 'Tree lopping',
      vendor: 'Canopy Care Arborists',
      amount: 360,
      gst: 36,
      notes: 'Pruned jacaranda branches away from roofline.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-15-tree.pdf',
      label: 'Jacaranda pruning',
    },
    {
      id: 'exp-2025-09-16-oak-pool',
      propertyId: property2Id,
      date: '2025-09-16',
      category: 'Pool maintenance',
      vendor: 'BlueWave Pools',
      amount: 210,
      gst: 21,
      notes: 'Chemical balance, vacuum, and filter backwash.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-16-pool.pdf',
    },
    {
      id: 'exp-2025-09-17-oak-fire',
      propertyId: property2Id,
      date: '2025-09-17',
      category: 'Fire safety compliance',
      vendor: 'SafeExit Fire Services',
      amount: 190,
      gst: 19,
      notes: 'Tested smoke alarms and replaced expired extinguisher.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-17-fire.pdf',
      label: 'Annual fire service',
    },
    {
      id: 'exp-2025-09-18-oak-gutter',
      propertyId: property2Id,
      date: '2025-09-18',
      category: 'Gutter cleaning',
      vendor: 'ClearFlow Roofing',
      amount: 155,
      gst: 15.5,
      notes: 'Cleared gutters and downpipes before storm season.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-18-gutter.pdf',
    },
    {
      id: 'exp-2025-09-19-oak-security',
      propertyId: property2Id,
      date: '2025-09-19',
      category: 'Security monitoring',
      vendor: 'NightWatch Security',
      amount: 120,
      gst: 12,
      notes: 'Monthly patrol service for rear laneway.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-19-security.pdf',
    },
    {
      id: 'exp-2025-09-20-oak-landscaping',
      propertyId: property2Id,
      date: '2025-09-20',
      category: 'Landscaping design',
      vendor: 'Verdant Concepts',
      amount: 240,
      gst: 24,
      notes: 'Concept plan for front verge refresh.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-20-landscaping.pdf',
      label: 'Front verge concept',
    },
    {
      id: 'exp-2025-09-21-oak-plumbing',
      propertyId: property2Id,
      date: '2025-09-21',
      category: 'Plumbing',
      vendor: 'RapidFlow Plumbing',
      amount: 205,
      gst: 20.5,
      notes: 'Cleared partial blockage in ensuite shower drain.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-21-plumbing.pdf',
    },
    {
      id: 'exp-2025-09-22-oak-paint',
      propertyId: property2Id,
      date: '2025-09-22',
      category: 'Painting',
      vendor: 'Brush & Roll Painters',
      amount: 180,
      gst: 18,
      notes: 'Touched up scuffed hallway walls after furniture move.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-22-paint.pdf',
    },
    {
      id: 'exp-2025-09-23-oak-solar',
      propertyId: property2Id,
      date: '2025-09-23',
      category: 'Solar maintenance',
      vendor: 'Sunset Renewables',
      amount: 230,
      gst: 23,
      notes: 'Inspection and clean of rooftop solar array.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-23-solar.pdf',
      label: 'Spring solar service',
    },
    {
      id: 'exp-2025-09-24-oak-pest-followup',
      propertyId: property2Id,
      date: '2025-09-24',
      category: 'Pest control',
      vendor: 'Shield Pest Experts',
      amount: 125,
      gst: 12.5,
      notes: 'Follow-up baiting for ant activity in pantry.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-24-pest.pdf',
    },
    {
      id: 'exp-2025-09-25-oak-misc',
      propertyId: property2Id,
      date: '2025-09-25',
      category: 'Miscellaneous',
      vendor: 'Bunnings Warehouse',
      amount: 90,
      gst: 9,
      notes: 'Purchased weather seals and replacement light globes.',
      receiptUrl: 'https://example.com/receipts/oak/2025-09-25-misc.pdf',
      label: 'Maintenance supplies',
    },
  ];

  for (const expense of expenseSeed) {
    const { propertyId: expensePropertyId = propertyId, ...expenseData } = expense;
    await prisma.mockData.create({
      data: {
        id: expense.id,
        type: 'expense',
        data: { propertyId: expensePropertyId, ...expenseData },
      },
    });
  }

  const incomeSeed = [
    {
      id: 'inc-2025-09-01-rent',
      tenantId,
      date: '2025-09-01',
      category: 'Base rent',
      amount: 650,
      notes: 'Rent payment for the first week of September.',
      label: 'Week 1 rent',
      evidenceUrl: 'https://example.com/income/2025-09-01-rent.pdf',
      evidenceName: '2025-09-01-rent.pdf',
    },
    {
      id: 'inc-2025-09-02-rent',
      tenantId,
      date: '2025-09-02',
      category: 'Base rent',
      amount: 650,
      notes: 'Automated transfer received overnight.',
      label: 'Week 2 rent',
      evidenceUrl: 'https://example.com/income/2025-09-02-rent.pdf',
      evidenceName: '2025-09-02-rent.pdf',
    },
    {
      id: 'inc-2025-09-02-utilities',
      tenantId,
      date: '2025-09-02',
      category: 'Utilities reimbursement',
      amount: 92,
      notes: 'Tenant reimbursed water usage charge for winter quarter.',
      label: 'Water usage reimbursement',
      evidenceUrl: 'https://example.com/income/2025-09-02-utilities.pdf',
      evidenceName: '2025-09-02-utilities.pdf',
    },
    {
      id: 'inc-2025-09-03-utilities',
      tenantId,
      date: '2025-09-03',
      category: 'Utilities reimbursement',
      amount: 90,
      notes: 'Shared electricity cost for common area lighting.',
      label: 'Electricity reimbursement',
      evidenceUrl: 'https://example.com/income/2025-09-03-utilities.pdf',
      evidenceName: '2025-09-03-utilities.pdf',
    },
    {
      id: 'inc-2025-09-04-repairs',
      tenantId,
      date: '2025-09-04',
      category: 'Repairs reimbursement',
      amount: 120,
      notes: 'Tenant reimbursed accidental damage to laundry door.',
      label: 'Laundry door repair reimbursement',
      evidenceUrl: 'https://example.com/income/2025-09-04-repairs.pdf',
      evidenceName: '2025-09-04-repairs.pdf',
    },
    {
      id: 'inc-2025-09-05-parking',
      tenantId,
      date: '2025-09-05',
      category: 'Parking space rent',
      amount: 45,
      notes: 'Parking space license for visitor bay.',
      label: 'Parking licence',
      evidenceUrl: 'https://example.com/income/2025-09-05-parking.pdf',
      evidenceName: '2025-09-05-parking.pdf',
    },
    {
      id: 'inc-2025-09-06-storage',
      tenantId,
      date: '2025-09-06',
      category: 'Storage/garage rent',
      amount: 55,
      notes: 'Monthly storage cage rental.',
      label: 'Storage cage',
      evidenceUrl: 'https://example.com/income/2025-09-06-storage.pdf',
      evidenceName: '2025-09-06-storage.pdf',
    },
    {
      id: 'inc-2025-09-07-cleaning',
      tenantId,
      date: '2025-09-07',
      category: 'Short-stay cleaning/host fee',
      amount: 80,
      notes: 'Cleaning fee charged to short-stay guest.',
      label: 'Short-stay cleaning',
      evidenceUrl: 'https://example.com/income/2025-09-07-cleaning.pdf',
      evidenceName: '2025-09-07-cleaning.pdf',
    },
    {
      id: 'inc-2025-09-08-insurance-damage',
      tenantId,
      date: '2025-09-08',
      category: 'Insurance payout – damage',
      amount: 350,
      notes: 'Insurance reimbursement for storm damage to pergola.',
      label: 'Insurance claim payout',
      evidenceUrl: 'https://example.com/income/2025-09-08-insurance-damage.pdf',
      evidenceName: '2025-09-08-insurance-damage.pdf',
    },
    {
      id: 'inc-2025-09-09-rent',
      tenantId,
      date: '2025-09-09',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment received on time.',
      label: 'Week 3 rent',
      evidenceUrl: 'https://example.com/income/2025-09-09-rent.pdf',
      evidenceName: '2025-09-09-rent.pdf',
    },
    {
      id: 'inc-2025-09-10-reletting',
      tenantId,
      date: '2025-09-10',
      category: 'Break lease / reletting fee',
      amount: 220,
      notes: 'Reletting fee charged after adding new tenant to lease.',
      label: 'Reletting fee',
      evidenceUrl: 'https://example.com/income/2025-09-10-reletting.pdf',
      evidenceName: '2025-09-10-reletting.pdf',
    },
    {
      id: 'inc-2025-09-11-late-fee',
      tenantId,
      date: '2025-09-11',
      category: 'Late fee',
      amount: 45,
      notes: 'Fee for late rent submitted after reminder.',
      label: 'September late fee',
      evidenceUrl: 'https://example.com/income/2025-09-11-late-fee.pdf',
      evidenceName: '2025-09-11-late-fee.pdf',
    },
    {
      id: 'inc-2025-09-12-grant',
      tenantId,
      date: '2025-09-12',
      category: 'Government grant/subsidy',
      amount: 130,
      notes: 'State government energy efficiency subsidy.',
      label: 'Energy grant',
      evidenceUrl: 'https://example.com/income/2025-09-12-grant.pdf',
      evidenceName: '2025-09-12-grant.pdf',
    },
    {
      id: 'inc-2025-09-13-misc',
      tenantId,
      date: '2025-09-13',
      category: 'Miscellaneous income',
      amount: 75,
      notes: 'Laundry machine coin collection.',
      label: 'Laundry income',
      evidenceUrl: 'https://example.com/income/2025-09-13-misc.pdf',
      evidenceName: '2025-09-13-misc.pdf',
    },
    {
      id: 'inc-2025-09-14-arrears',
      tenantId,
      date: '2025-09-14',
      category: 'Arrears catch-up',
      amount: 320,
      notes: 'Partial arrears cleared from earlier in year.',
      label: 'Arrears catch-up',
      evidenceUrl: 'https://example.com/income/2025-09-14-arrears.pdf',
      evidenceName: '2025-09-14-arrears.pdf',
    },
    {
      id: 'inc-2025-09-15-insurance',
      tenantId,
      date: '2025-09-15',
      category: 'Insurance payout – rent default',
      amount: 400,
      notes: 'Insurance payment covering tenant hardship in July.',
      label: 'Rent default cover',
      evidenceUrl: 'https://example.com/income/2025-09-15-insurance.pdf',
      evidenceName: '2025-09-15-insurance.pdf',
    },
    {
      id: 'inc-2025-09-16-rent',
      tenantId,
      date: '2025-09-16',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 4 rent',
      evidenceUrl: 'https://example.com/income/2025-09-16-rent.pdf',
      evidenceName: '2025-09-16-rent.pdf',
    },
    {
      id: 'inc-2025-09-17-utilities',
      tenantId,
      date: '2025-09-17',
      category: 'Utilities reimbursement',
      amount: 85,
      notes: 'Gas usage reimbursement for winter heating.',
      label: 'Gas reimbursement',
      evidenceUrl: 'https://example.com/income/2025-09-17-utilities.pdf',
      evidenceName: '2025-09-17-utilities.pdf',
    },
    {
      id: 'inc-2025-09-18-repairs',
      tenantId,
      date: '2025-09-18',
      category: 'Repairs reimbursement',
      amount: 110,
      notes: 'Reimbursement for damaged flyscreen replacement.',
      label: 'Flyscreen repair reimbursement',
      evidenceUrl: 'https://example.com/income/2025-09-18-repairs.pdf',
      evidenceName: '2025-09-18-repairs.pdf',
    },
    {
      id: 'inc-2025-09-19-parking',
      tenantId,
      date: '2025-09-19',
      category: 'Parking space rent',
      amount: 45,
      notes: 'Visitor parking allocation for trades during works.',
      label: 'Trades parking',
      evidenceUrl: 'https://example.com/income/2025-09-19-parking.pdf',
      evidenceName: '2025-09-19-parking.pdf',
    },
    {
      id: 'inc-2025-09-20-storage',
      tenantId,
      date: '2025-09-20',
      category: 'Storage/garage rent',
      amount: 55,
      notes: 'Short-term storage hire for holiday items.',
      label: 'Storage hire',
      evidenceUrl: 'https://example.com/income/2025-09-20-storage.pdf',
      evidenceName: '2025-09-20-storage.pdf',
    },
    {
      id: 'inc-2025-09-21-cleaning',
      tenantId,
      date: '2025-09-21',
      category: 'Short-stay cleaning/host fee',
      amount: 90,
      notes: 'Cleaning charge after weekend Airbnb stay.',
      label: 'Weekend turnover clean',
      evidenceUrl: 'https://example.com/income/2025-09-21-cleaning.pdf',
      evidenceName: '2025-09-21-cleaning.pdf',
    },
    {
      id: 'inc-2025-09-22-misc',
      tenantId,
      date: '2025-09-22',
      category: 'Miscellaneous income',
      amount: 60,
      notes: 'Miscellaneous key replacement reimbursement.',
      label: 'Key replacement',
      evidenceUrl: 'https://example.com/income/2025-09-22-misc.pdf',
      evidenceName: '2025-09-22-misc.pdf',
    },
    {
      id: 'inc-2025-09-23-rent',
      tenantId,
      date: '2025-09-23',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment received early in the morning.',
      label: 'Week 5 rent',
      evidenceUrl: 'https://example.com/income/2025-09-23-rent.pdf',
      evidenceName: '2025-09-23-rent.pdf',
    },
    {
      id: 'inc-2025-09-24-late-fee',
      tenantId,
      date: '2025-09-24',
      category: 'Late fee',
      amount: 35,
      notes: 'Late fee for delayed utilities reimbursement.',
      label: 'Utilities late fee',
      evidenceUrl: 'https://example.com/income/2025-09-24-late-fee.pdf',
      evidenceName: '2025-09-24-late-fee.pdf',
    },
    {
      id: 'inc-2025-09-25-grant',
      tenantId,
      date: '2025-09-25',
      category: 'Government grant/subsidy',
      amount: 125,
      notes: 'Sustainability retrofit rebate received from council.',
      label: 'Sustainability grant',
      evidenceUrl: 'https://example.com/income/2025-09-25-grant.pdf',
      evidenceName: '2025-09-25-grant.pdf',
    },
    {
      id: 'inc-2025-08-26-rent',
      tenantId,
      date: '2025-08-26',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 4 August rent',
      evidenceUrl: 'https://example.com/income/2025-08-26-rent.pdf',
      evidenceName: '2025-08-26-rent.pdf',
    },
    {
      id: 'inc-2025-08-21-late-fee',
      tenantId,
      date: '2025-08-21',
      category: 'Late fee',
      amount: 45,
      notes: 'Charged after rent cleared two days late',
      label: 'August late fee',
      evidenceUrl: 'https://example.com/income/2025-08-21-late-fee.pdf',
      evidenceName: '2025-08-21-late-fee.pdf',
    },
    {
      id: 'inc-2025-08-19-rent',
      tenantId,
      date: '2025-08-19',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 3 August rent',
      evidenceUrl: 'https://example.com/income/2025-08-19-rent.pdf',
      evidenceName: '2025-08-19-rent.pdf',
    },
    {
      id: 'inc-2025-08-12-rent',
      tenantId,
      date: '2025-08-12',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 2 August rent',
      evidenceUrl: 'https://example.com/income/2025-08-12-rent.pdf',
      evidenceName: '2025-08-12-rent.pdf',
    },
    {
      id: 'inc-2025-08-05-rent',
      tenantId,
      date: '2025-08-05',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 1 August rent',
      evidenceUrl: 'https://example.com/income/2025-08-05-rent.pdf',
      evidenceName: '2025-08-05-rent.pdf',
    },
    {
      id: 'inc-2025-07-29-rent',
      tenantId,
      date: '2025-07-29',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 5 July rent',
      evidenceUrl: 'https://example.com/income/2025-07-29-rent.pdf',
      evidenceName: '2025-07-29-rent.pdf',
    },
    {
      id: 'inc-2025-07-22-rent',
      tenantId,
      date: '2025-07-22',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 4 July rent',
      evidenceUrl: 'https://example.com/income/2025-07-22-rent.pdf',
      evidenceName: '2025-07-22-rent.pdf',
    },
    {
      id: 'inc-2025-07-16-rent',
      tenantId,
      date: '2025-07-16',
      category: 'Base rent',
      amount: 650,
      notes: 'Weekly rent payment',
      label: 'Week 3 July rent',
      evidenceUrl: 'https://example.com/income/2025-07-16-rent.pdf',
      evidenceName: '2025-07-16-rent.pdf',
    },
    {
      id: 'inc-2025-09-01-oak-rent',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-01',
      category: 'Base rent',
      amount: 475,
      notes: 'Fortnight 1 rent from Bob Renter.',
      label: 'Week 1 rent',
      evidenceUrl: 'https://example.com/income/oak/2025-09-01-rent.pdf',
      evidenceName: '2025-09-01-rent.pdf',
    },
    {
      id: 'inc-2025-09-02-oak-utilities',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-02',
      category: 'Utilities reimbursement',
      amount: 88,
      notes: 'Tenant reimbursed shared water usage.',
      label: 'Water reimbursement',
      evidenceUrl: 'https://example.com/income/oak/2025-09-02-utilities.pdf',
      evidenceName: '2025-09-02-utilities.pdf',
    },
    {
      id: 'inc-2025-09-03-oak-parking',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-03',
      category: 'Parking space rent',
      amount: 40,
      notes: 'Visitor parking licence billed to corporate tenant.',
      label: 'Visitor parking pass',
      evidenceUrl: 'https://example.com/income/oak/2025-09-03-parking.pdf',
      evidenceName: '2025-09-03-parking.pdf',
    },
    {
      id: 'inc-2025-09-04-oak-storage',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-04',
      category: 'Storage/garage rent',
      amount: 50,
      notes: 'Storage cage rental for seasonal items.',
      label: 'Storage cage hire',
      evidenceUrl: 'https://example.com/income/oak/2025-09-04-storage.pdf',
      evidenceName: '2025-09-04-storage.pdf',
    },
    {
      id: 'inc-2025-09-05-oak-cleaning',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-05',
      category: 'Short-stay cleaning/host fee',
      amount: 95,
      notes: 'Cleaning fee charged back after guest stay.',
      label: 'Guest cleaning',
      evidenceUrl: 'https://example.com/income/oak/2025-09-05-cleaning.pdf',
      evidenceName: '2025-09-05-cleaning.pdf',
    },
    {
      id: 'inc-2025-09-06-oak-insurance-damage',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-06',
      category: 'Insurance payout – damage',
      amount: 260,
      notes: 'Insurer reimbursed patio awning repair.',
      label: 'Damage claim payout',
      evidenceUrl: 'https://example.com/income/oak/2025-09-06-insurance.pdf',
      evidenceName: '2025-09-06-insurance.pdf',
    },
    {
      id: 'inc-2025-09-07-oak-arrears',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-07',
      category: 'Arrears catch-up',
      amount: 180,
      notes: 'Cleared balance from August rent shortfall.',
      label: 'August arrears catch-up',
      evidenceUrl: 'https://example.com/income/oak/2025-09-07-arrears.pdf',
      evidenceName: '2025-09-07-arrears.pdf',
    },
    {
      id: 'inc-2025-09-08-oak-rent',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-08',
      category: 'Base rent',
      amount: 475,
      notes: 'Fortnight 2 rent received ahead of due date.',
      label: 'Week 2 rent',
      evidenceUrl: 'https://example.com/income/oak/2025-09-08-rent.pdf',
      evidenceName: '2025-09-08-rent.pdf',
    },
    {
      id: 'inc-2025-09-09-oak-repairs',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-09',
      category: 'Repairs reimbursement',
      amount: 90,
      notes: 'Reimbursed for garden reticulation timer replacement.',
      label: 'Garden timer reimbursement',
      evidenceUrl: 'https://example.com/income/oak/2025-09-09-repairs.pdf',
      evidenceName: '2025-09-09-repairs.pdf',
    },
    {
      id: 'inc-2025-09-10-oak-grant',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-10',
      category: 'Government grant/subsidy',
      amount: 140,
      notes: 'NSW sustainability rebate credited to owner.',
      label: 'Sustainability rebate',
      evidenceUrl: 'https://example.com/income/oak/2025-09-10-grant.pdf',
      evidenceName: '2025-09-10-grant.pdf',
    },
    {
      id: 'inc-2025-09-11-oak-late-fee',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-11',
      category: 'Late fee',
      amount: 45,
      notes: 'Charged after utilities reimbursement overdue.',
      label: 'Utilities late fee',
      evidenceUrl: 'https://example.com/income/oak/2025-09-11-late-fee.pdf',
      evidenceName: '2025-09-11-late-fee.pdf',
    },
    {
      id: 'inc-2025-09-12-oak-pet',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-12',
      category: 'Miscellaneous income',
      amount: 85,
      notes: 'Monthly pet rent for approved small dog.',
      label: 'Pet rent',
      evidenceUrl: 'https://example.com/income/oak/2025-09-12-pet.pdf',
      evidenceName: '2025-09-12-pet.pdf',
    },
    {
      id: 'inc-2025-09-13-oak-misc',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-13',
      category: 'Miscellaneous income',
      amount: 70,
      notes: 'Laundry machine coin sweep for Oak Ave duplex.',
      label: 'Laundry income',
      evidenceUrl: 'https://example.com/income/oak/2025-09-13-misc.pdf',
      evidenceName: '2025-09-13-misc.pdf',
    },
    {
      id: 'inc-2025-09-14-oak-utilities',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-14',
      category: 'Utilities reimbursement',
      amount: 92,
      notes: 'Gas usage reimbursement for winter heating.',
      label: 'Gas reimbursement',
      evidenceUrl: 'https://example.com/income/oak/2025-09-14-utilities.pdf',
      evidenceName: '2025-09-14-utilities.pdf',
    },
    {
      id: 'inc-2025-09-15-oak-rent',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-15',
      category: 'Base rent',
      amount: 475,
      notes: 'Fortnight 3 rent deposit received.',
      label: 'Week 3 rent',
      evidenceUrl: 'https://example.com/income/oak/2025-09-15-rent.pdf',
      evidenceName: '2025-09-15-rent.pdf',
    },
    {
      id: 'inc-2025-09-16-oak-repairs',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-16',
      category: 'Repairs reimbursement',
      amount: 135,
      notes: 'Reimbursed emergency plumber attendance fee.',
      label: 'Plumber reimbursement',
      evidenceUrl: 'https://example.com/income/oak/2025-09-16-repairs.pdf',
      evidenceName: '2025-09-16-repairs.pdf',
    },
    {
      id: 'inc-2025-09-17-oak-parking',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-17',
      category: 'Parking space rent',
      amount: 40,
      notes: 'Trades parking allocation billed during gutter works.',
      label: 'Trades parking',
      evidenceUrl: 'https://example.com/income/oak/2025-09-17-parking.pdf',
      evidenceName: '2025-09-17-parking.pdf',
    },
    {
      id: 'inc-2025-09-18-oak-insurance',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-18',
      category: 'Insurance payout – rent default',
      amount: 300,
      notes: 'Insurance covered partial rent during July hardship.',
      label: 'Rent default cover',
      evidenceUrl: 'https://example.com/income/oak/2025-09-18-insurance.pdf',
      evidenceName: '2025-09-18-insurance.pdf',
    },
    {
      id: 'inc-2025-09-19-oak-cleaning',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-19',
      category: 'Short-stay cleaning/host fee',
      amount: 105,
      notes: 'Mid-stay cleaning billed to tenant hosting guests.',
      label: 'Mid-stay clean',
      evidenceUrl: 'https://example.com/income/oak/2025-09-19-cleaning.pdf',
      evidenceName: '2025-09-19-cleaning.pdf',
    },
    {
      id: 'inc-2025-09-20-oak-storage',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-20',
      category: 'Storage/garage rent',
      amount: 50,
      notes: 'Additional storage bay for surfboards.',
      label: 'Garage bay hire',
      evidenceUrl: 'https://example.com/income/oak/2025-09-20-storage.pdf',
      evidenceName: '2025-09-20-storage.pdf',
    },
    {
      id: 'inc-2025-09-21-oak-misc',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-21',
      category: 'Miscellaneous income',
      amount: 65,
      notes: 'Key replacement fee billed after lost spare.',
      label: 'Key replacement',
      evidenceUrl: 'https://example.com/income/oak/2025-09-21-misc.pdf',
      evidenceName: '2025-09-21-misc.pdf',
    },
    {
      id: 'inc-2025-09-22-oak-grant',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-22',
      category: 'Government grant/subsidy',
      amount: 110,
      notes: 'Solar feed-in credit applied to owner statement.',
      label: 'Solar credit',
      evidenceUrl: 'https://example.com/income/oak/2025-09-22-grant.pdf',
      evidenceName: '2025-09-22-grant.pdf',
    },
    {
      id: 'inc-2025-09-23-oak-rent',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-23',
      category: 'Base rent',
      amount: 475,
      notes: 'Fortnight 4 rent received via bank transfer.',
      label: 'Week 4 rent',
      evidenceUrl: 'https://example.com/income/oak/2025-09-23-rent.pdf',
      evidenceName: '2025-09-23-rent.pdf',
    },
    {
      id: 'inc-2025-09-24-oak-late-fee',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-24',
      category: 'Late fee',
      amount: 35,
      notes: 'Fee applied for late garden reimbursement.',
      label: 'Garden late fee',
      evidenceUrl: 'https://example.com/income/oak/2025-09-24-late-fee.pdf',
      evidenceName: '2025-09-24-late-fee.pdf',
    },
    {
      id: 'inc-2025-09-25-oak-utilities',
      propertyId: property2Id,
      tenantId: tenant2Id,
      date: '2025-09-25',
      category: 'Utilities reimbursement',
      amount: 86,
      notes: 'Electricity usage for smart irrigation system.',
      label: 'Electricity reimbursement',
      evidenceUrl: 'https://example.com/income/oak/2025-09-25-utilities.pdf',
      evidenceName: '2025-09-25-utilities.pdf',
    },
  ];

  for (const income of incomeSeed) {
    const {
      propertyId: incomePropertyId = propertyId,
      tenantId: incomeTenantId = tenantId,
      ...incomeData
    } = income;
    await prisma.mockData.create({
      data: {
        id: income.id,
        type: 'income',
        data: { propertyId: incomePropertyId, tenantId: incomeTenantId, ...incomeData },
      },
    });
  }

  const rentLedgerSeed = incomeSeed
    .filter((income) =>
      ['Base rent', 'Arrears catch-up'].includes(income.category)
    )
    .map((income) => {
      const targetPropertyId = income.propertyId ?? propertyId;
      const targetTenantId = income.tenantId ?? tenantId;
      return {
        id: `ledger-${income.id}`,
        propertyId: targetPropertyId,
        tenantId: targetTenantId,
        amount: income.amount,
        dueDate: income.date,
        status: 'paid',
        paidDate: income.date,
        sourceIncomeId: income.id,
        description: income.label ?? income.category,
        evidenceUrl: income.evidenceUrl,
        evidenceName: income.evidenceName,
      };
    });

  for (const ledger of rentLedgerSeed) {
    await prisma.mockData.create({
      data: {
        id: ledger.id,
        type: 'rentLedger',
        data: ledger,
      },
    });
  }

  const inspectionSeed = [
    {
      id: 'insp-2025-09-01-entry',
      propertyId,
      type: 'Entry',
      status: 'Completed',
      date: '2025-09-01T09:00:00+10:00',
      notes: 'Move-in condition documented with photos and meter readings.',
      inspector: 'Ava Owner',
      reportUrl: 'https://example.com/inspections/2025-09-01-entry.pdf',
    },
    {
      id: 'insp-2025-09-08-routine',
      propertyId,
      type: 'Routine',
      status: 'Completed',
      date: '2025-09-08T11:30:00+10:00',
      notes: 'Routine inspection with focus on wet areas and smoke alarms.',
      inspector: 'Ava Owner',
      reportUrl: 'https://example.com/inspections/2025-09-08-routine.pdf',
    },
    {
      id: 'insp-2025-09-15-routine',
      propertyId,
      type: 'Routine',
      status: 'Scheduled',
      date: '2025-09-15T14:00:00+10:00',
      notes: 'Follow-up inspection to verify bathroom reseal works.',
      inspector: 'Sam Tradie',
    },
    {
      id: 'insp-2025-09-22-exit',
      propertyId,
      type: 'Exit',
      status: 'Scheduled',
      date: '2025-09-22T10:00:00+10:00',
      notes: 'Exit inspection booked ahead of tenant holiday.',
      inspector: 'Ava Owner',
    },
    {
      id: 'insp-oak-2025-09-04-routine',
      propertyId: property2Id,
      type: 'Routine',
      status: 'Completed',
      date: '2025-09-04T09:30:00+10:00',
      notes: 'Routine walkthrough after dishwasher repair.',
      inspector: 'Jordan Inspector',
      reportUrl: 'https://example.com/inspections/oak/2025-09-04-routine.pdf',
    },
    {
      id: 'insp-oak-2025-09-13-pool',
      propertyId: property2Id,
      type: 'Pool',
      status: 'Completed',
      date: '2025-09-13T13:00:00+10:00',
      notes: 'Verified pool fence and chemical balance ahead of summer.',
      inspector: 'Jordan Inspector',
      reportUrl: 'https://example.com/inspections/oak/2025-09-13-pool.pdf',
    },
    {
      id: 'insp-oak-2025-09-21-routine',
      propertyId: property2Id,
      type: 'Routine',
      status: 'Scheduled',
      date: '2025-09-21T15:00:00+10:00',
      notes: 'Follow-up to confirm landscaping works completed.',
      inspector: 'Ava Owner',
    },
  ];

  for (const inspection of inspectionSeed) {
    await prisma.mockData.create({
      data: {
        id: inspection.id,
        type: 'inspection',
        data: inspection,
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

