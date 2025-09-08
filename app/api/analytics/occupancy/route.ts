import { properties, isActiveProperty } from '../../store';
import { seedIfEmpty } from '../../store';
import type { Occupancy } from '../../../../types/analytics';

function getRange(search: URLSearchParams) {
  const from = search.get('from');
  const to = search.get('to');
  if (from && to) return { from: new Date(from), to: new Date(to) };
  const dates = properties.map((p) => p.leaseEnd).filter(Boolean).sort();
  const latest = dates[dates.length - 1];
  const toDate = latest ? new Date(latest) : new Date();
  const fromDate = new Date(toDate);
  fromDate.setMonth(fromDate.getMonth() - 5);
  fromDate.setDate(1);
  return { from: fromDate, to: toDate };
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export function computeOccupancy(params: {
  from?: Date;
  to?: Date;
  propertyId?: string;
}): Occupancy {
  const { from, to, propertyId } = params;
  const fromDate = from || new Date('1970-01-01');
  const toDate = to || new Date('2100-01-01');
  const allowed = propertyId
    ? [propertyId]
    : properties.filter(isActiveProperty).map((p) => p.id);

  const periodDays = daysBetween(fromDate, toDate) * allowed.length;
  let occupiedDays = 0;

  for (const p of properties) {
    if (!allowed.includes(p.id) || !p.leaseStart || !p.leaseEnd) continue;
    const leaseStart = new Date(p.leaseStart);
    const leaseEnd = new Date(p.leaseEnd);
    const start = leaseStart > fromDate ? leaseStart : fromDate;
    const end = leaseEnd < toDate ? leaseEnd : toDate;
    if (start <= end) {
      occupiedDays += daysBetween(start, end);
    }
  }
  const vacantDays = periodDays - occupiedDays;
  const occupancyRate = periodDays ? occupiedDays / periodDays : 0;
  return { occupiedDays, vacantDays, occupancyRate };
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const { from, to } = getRange(searchParams);
  const propertyId = searchParams.get('propertyId') || undefined;
  const data = computeOccupancy({ from, to, propertyId });
  return Response.json(data);
}
