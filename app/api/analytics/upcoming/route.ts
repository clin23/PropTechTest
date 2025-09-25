import { NextResponse } from 'next/server';
import {
  seedIfEmpty,
  reminders,
  properties,
  isActiveProperty,
} from '../../store';

function parseProperties(search: URLSearchParams, fallback: Set<string>) {
  const raw = search.get('propertyIds');
  if (!raw) return fallback;
  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id) => fallback.has(id));
  return new Set(ids.length ? ids : [...fallback]);
}

function mapType(type: string, title: string):
  | 'lease'
  | 'insurance'
  | 'smokeAlarm'
  | 'inspection' {
  switch (type) {
    case 'lease_expiry':
      return 'lease';
    case 'insurance_renewal':
      return 'insurance';
    case 'inspection_due':
      return 'inspection';
    default:
      return /smoke/i.test(title) ? 'smokeAlarm' : 'lease';
  }
}

export async function GET(req: Request) {
  seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const limit = Number.parseInt(searchParams.get('limit') ?? '5', 10) || 5;
  const active = new Set(properties.filter(isActiveProperty).map((p) => p.id));
  const propertyIds = parseProperties(searchParams, active);

  const today = new Date();
  const items = reminders
    .filter((reminder) => propertyIds.has(reminder.propertyId))
    .filter((reminder) => {
      const due = new Date(reminder.dueDate);
      return !Number.isNaN(due.getTime()) && due >= new Date(today.toDateString());
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit)
    .map((reminder) => {
      const property = properties.find((p) => p.id === reminder.propertyId);
      return {
        type: mapType(reminder.type, reminder.title),
        label: reminder.title,
        dueOn: reminder.dueDate,
        propertyLabel: property?.address ?? reminder.propertyId,
      };
    });

  return NextResponse.json({ items });
}
