import type { DashboardDTO } from '../types/dashboard';

// TODO: replace with real API call
export async function getDashboard(from: string, to: string): Promise<DashboardDTO> {
  const res = await fetch('/mock/mockDashboard.json');
  if (!res.ok) {
    throw new Error('Failed to load dashboard');
  }
  return (await res.json()) as DashboardDTO;
}
