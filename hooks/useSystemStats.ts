import { useState, useEffect, useCallback, useRef } from 'react';
import { StatsService } from '@/services/stats.service';
import type {
  SystemOverviewResponse,
  StatsTrendResponse,
  WebhookStatsResponse,
  DeploymentHistory,
  DeploymentFilters,
  TopAppResponse,
  HourlyStatsResponse,
  DeploymentStatusDistributionResponse,
  BranchStatsResponse,
} from '@/types/stats';

interface UseSystemStatsOptions {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSystemStats(options: UseSystemStatsOptions = {}) {
  const { timeRange = 'month', startDate, endDate, autoRefresh = false, refreshInterval = 60000 } = options;

  const [overview, setOverview] = useState<SystemOverviewResponse | null>(null);
  const [trend, setTrend] = useState<StatsTrendResponse | null>(null);
  const [previousTrend, setPreviousTrend] = useState<StatsTrendResponse | null>(null);
  const [webhookStats, setWebhookStats] = useState<WebhookStatsResponse | null>(null);
  const [topApps, setTopApps] = useState<TopAppResponse | null>(null);
  const [hourlyStats, setHourlyStats] = useState<HourlyStatsResponse | null>(null);
  const [deployments, setDeployments] = useState<DeploymentHistory[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<DeploymentStatusDistributionResponse | null>(null);
  const [branchStats, setBranchStats] = useState<BranchStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const requestIdRef = useRef(0);

  const fetchOverview = useCallback(async () => {
    const currentRequestId = requestIdRef.current;
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      }
      
      const data = await StatsService.getSystemOverview(timeRange, startDateISO, endDateISO);
      
      if (currentRequestId === requestIdRef.current) {
        setOverview(data);
        setError(null);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch system overview'));
      }
    }
  }, [timeRange, startDate, endDate]);

  const fetchTrend = useCallback(
    async (type: 'deployments' | 'users' | 'webhooks' = 'deployments') => {
      const currentRequestId = requestIdRef.current;
      try {
        let startDateISO: string | undefined;
        let endDateISO: string | undefined;
        
        if (startDate && endDate) {
          startDateISO = new Date(startDate + 'T00:00:00').toISOString();
          endDateISO = new Date(endDate + 'T23:59:59').toISOString();
        } else if (timeRange === 'custom' && startDate && endDate) {
          startDateISO = new Date(startDate + 'T00:00:00').toISOString();
          endDateISO = new Date(endDate + 'T23:59:59').toISOString();
        }
        
        const currentData = await StatsService.getTrend(type, timeRange, startDateISO, endDateISO);
        
        if (currentRequestId === requestIdRef.current) {
          setTrend(currentData || { type, timeRange: timeRange as any, dataPoints: [] });
          
          if (timeRange !== 'custom' && !startDate && !endDate) {
            try {
              const previousData = await StatsService.getPreviousPeriodTrend(type, timeRange);
              if (currentRequestId === requestIdRef.current) {
                setPreviousTrend(previousData || { type, timeRange: timeRange as any, dataPoints: [] });
              }
            } catch (prevErr) {
              if (currentRequestId === requestIdRef.current) {
                setPreviousTrend({ type, timeRange: timeRange as any, dataPoints: [] });
              }
            }
          } else {
            setPreviousTrend({ type, timeRange: timeRange as any, dataPoints: [] });
          }
          
          setError(null);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          setError(err instanceof Error ? err : new Error('Failed to fetch trend'));
          setTrend({ type, timeRange: timeRange as any, dataPoints: [] });
          setPreviousTrend({ type, timeRange: timeRange as any, dataPoints: [] });
        }
      }
    },
    [timeRange, startDate, endDate]
  );

  const fetchWebhookStats = useCallback(async () => {
    const currentRequestId = requestIdRef.current;
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      }
      
      const data = await StatsService.getWebhookStats(timeRange, startDateISO, endDateISO);
      
      if (currentRequestId === requestIdRef.current) {
        setWebhookStats(data);
        setError(null);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch webhook stats'));
      }
    }
  }, [timeRange, startDate, endDate]);

  const fetchDeployments = useCallback(async (filters: DeploymentFilters = {}) => {
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      } else {
        const now = new Date();
        let start: Date;
        let end: Date;
        
        if (timeRange === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (timeRange === 'year') {
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        
        startDateISO = start.toISOString();
        endDateISO = end.toISOString();
      }
      
      const requestParams = { 
        ...filters, 
        timeRange: timeRange as any,
        startDate: startDateISO,
        endDate: endDateISO,
      };
      
      const data = await StatsService.getDeployments(requestParams);
      setDeployments(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch deployments'));
      setDeployments([]);
    }
  }, [timeRange, startDate, endDate]);

  const fetchTopApps = useCallback(async () => {
    const currentRequestId = requestIdRef.current;
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      }
      
      const data = await StatsService.getTopApps(timeRange, 5, startDateISO, endDateISO);
      
      if (currentRequestId === requestIdRef.current) {
        setTopApps(data);
        setError(null);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch top apps'));
      }
    }
  }, [timeRange, startDate, endDate]);

  const fetchHourlyStats = useCallback(async () => {
    const currentRequestId = requestIdRef.current;
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      }
      
      const data = await StatsService.getHourlyStats(timeRange, startDateISO, endDateISO);
      
      if (currentRequestId === requestIdRef.current) {
        setHourlyStats(data);
        setError(null);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch hourly stats'));
      }
    }
  }, [timeRange, startDate, endDate]);

  const fetchStatusDistribution = useCallback(async () => {
    const currentRequestId = requestIdRef.current;
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      }
      
      const data = await StatsService.getDeploymentStatusDistribution(timeRange, startDateISO, endDateISO);
      
      if (currentRequestId === requestIdRef.current) {
        setStatusDistribution(data);
        setError(null);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch status distribution'));
      }
    }
  }, [timeRange, startDate, endDate]);

  const fetchBranchStats = useCallback(async () => {
    const currentRequestId = requestIdRef.current;
    try {
      let startDateISO: string | undefined;
      let endDateISO: string | undefined;
      
      if (startDate && endDate) {
        startDateISO = new Date(startDate + 'T00:00:00').toISOString();
        endDateISO = new Date(endDate + 'T23:59:59').toISOString();
      }
      
      const data = await StatsService.getBranchStats(timeRange, 10, startDateISO, endDateISO);
      
      if (currentRequestId === requestIdRef.current) {
        setBranchStats(data);
        setError(null);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch branch stats'));
      }
    }
  }, [timeRange, startDate, endDate]);

  const refresh = useCallback(async () => {
    const refreshRequestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOverview(), 
        fetchTrend('deployments'),
        fetchWebhookStats(),
        fetchTopApps(),
        fetchHourlyStats(),
        fetchStatusDistribution(),
        fetchBranchStats(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh stats'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchOverview, fetchTrend, fetchWebhookStats, fetchTopApps, fetchHourlyStats, fetchStatusDistribution, fetchBranchStats, timeRange, startDate, endDate]);

  useEffect(() => {
    setIsLoading(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        await Promise.allSettled([
          fetchOverview(), 
          fetchTrend('deployments'),
          fetchWebhookStats(),
          fetchTopApps(),
          fetchHourlyStats(),
          fetchStatusDistribution(),
          fetchBranchStats(),
          fetchDeployments(),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to refresh stats'));
      } finally {
        setIsLoading(false);
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, startDate, endDate, fetchDeployments]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    overview,
    trend,
    previousTrend,
    webhookStats,
    topApps,
    hourlyStats,
    deployments,
    statusDistribution,
    branchStats,
    isLoading,
    error,
    refresh,
    fetchOverview,
    fetchTrend,
    fetchWebhookStats,
    fetchTopApps,
    fetchHourlyStats,
    fetchDeployments,
    fetchStatusDistribution,
    fetchBranchStats,
  };
}

