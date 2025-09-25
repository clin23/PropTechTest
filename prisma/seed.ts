import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const userId = randomUUID();
  const propertyId = 'property1';
  const tenantId = randomUUID();
  const tenancyId = randomUUID();
  const paymentId = randomUUID();
  const paymentSept02Id = randomUUID();
  const paymentSept09Id = randomUUID();
  const paymentSept16Id = randomUUID();
  const paymentSept23Id = randomUUID();
  const job1Id = randomUUID();
  const job2Id = randomUUID();
  const job3Id = randomUUID();
  const complianceSmokeId = randomUUID();
  const complianceInspectionId = randomUUID();
  const complianceInsuranceId = randomUUID();
  const compliancePoolId = randomUUID();

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

  const paymentSeed = [
    {
      id: paymentId,
      date: '2025-08-25',
      amount: '650.00',
      method: 'BANK_TRANSFER',
      reference: 'Wk9 rent',
      notes: 'Rent payment received on time.',
    },
    {
      id: paymentSept02Id,
      date: '2025-09-02',
      amount: '650.00',
      method: 'BANK_TRANSFER',
      reference: 'Wk10 rent',
      notes: 'Rent covering 1-7 September.',
    },
    {
      id: paymentSept09Id,
      date: '2025-09-09',
      amount: '650.00',
      method: 'CARD',
      reference: 'Wk11 rent',
      notes: 'Paid via owner portal card payment.',
    },
    {
      id: paymentSept16Id,
      date: '2025-09-16',
      amount: '650.00',
      method: 'BANK_TRANSFER',
      reference: 'Wk12 rent',
      notes: 'Includes confirmation of rent increase.',
    },
    {
      id: paymentSept23Id,
      date: '2025-09-23',
      amount: '650.00',
      method: 'CASH',
      reference: 'Wk13 rent',
      notes: 'Processed by agency front desk after tenant visit.',
    },
  ];

  for (const payment of paymentSeed) {
    await prisma.payment.create({
      data: {
        id: payment.id,
        tenancyId,
        date_received: new Date(payment.date),
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        notes: payment.notes,
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

  const rentLedgerSeed = incomeSeed
    .filter((income) =>
      ['Base rent', 'Arrears catch-up'].includes(income.category)
    )
    .map((income) => ({
      id: `ledger-${income.id}`,
      propertyId,
      tenantId: income.tenantId ?? tenantId,
      amount: income.amount,
      dueDate: income.date,
      status: 'paid',
      paidDate: income.date,
      sourceIncomeId: income.id,
      description: income.label ?? income.category,
      evidenceUrl: income.evidenceUrl,
      evidenceName: income.evidenceName,
    }));

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

