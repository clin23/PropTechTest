import type { DashboardDTO } from '../types/dashboard';
import { api } from './api';

// Fetch dashboard data between date range
export async function getDashboard(from: string, to: string): Promise<DashboardDTO> {
  return api<DashboardDTO>(`/dashboard?from=${from}&to=${to}`);
}
