import useSWR from 'swr';
import { DashboardService } from '@/services/dashboard.service';
import type { DashboardOverview } from '@/types/dashboard';

/**
 * Hook to fetch dashboard overview data
 * Auto-refresh every 30 seconds for realtime updates
 */
export function useDashboardOverview() {
  const { data, error, isLoading, mutate } = useSWR<DashboardOverview>(
    '/dashboard',
    () => DashboardService.getOverview(),
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    overview: data,
    isLoading,
    isError: error,
    mutate,
  };
}
