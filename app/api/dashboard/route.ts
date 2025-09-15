import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import type { DashboardDTO } from '../../../types/dashboard';

export async function GET() {
  // TODO: replace file read with real database/service call
  const file = await fs.readFile(
    process.cwd() + '/public/mock/mockDashboard.json',
    'utf-8'
  );
  const data = JSON.parse(file) as DashboardDTO;
  return NextResponse.json(data);
}

