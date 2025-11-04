import { useState, useEffect } from 'react';
import { StatsService } from '@/services/stats.service';
import type { StatsTrendResponse } from '@/types/stats';

interface UseTrendChartOptions {
  chartType: "deployments" | "users" | "webhooks";
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export function useTrendChart(options: UseTrendChartOptions) {
  const { chartType, timeRange = "year", startDate, endDate } = options;
  const [trendChartData, setTrendChartData] = useState<StatsTrendResponse | null>(null);
  const [isLoadingTrendChart, setIsLoadingTrendChart] = useState(false);

  useEffect(() => {
    const fetchTrendChartData = async () => {
      setIsLoadingTrendChart(true);
      try {
        let startDateISO: string | undefined;
        let endDateISO: string | undefined;
        
        if (startDate && endDate) {
          startDateISO = new Date(startDate + 'T00:00:00').toISOString();
          endDateISO = new Date(endDate + 'T23:59:59').toISOString();
        }
        
        const data = await StatsService.getTrend(chartType, timeRange, startDateISO, endDateISO);
        setTrendChartData(data);
      } catch (err) {
        setTrendChartData({ type: chartType, timeRange, dataPoints: [] });
      } finally {
        setIsLoadingTrendChart(false);
      }
    };
    
    fetchTrendChartData();
  }, [chartType, timeRange, startDate, endDate]);

  return {
    trendChartData,
    isLoadingTrendChart,
  };
}

