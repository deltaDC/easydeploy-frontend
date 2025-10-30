import { useState, useCallback } from 'react';
import { monitoringService } from '@/services/monitoring.service';
import type {
  MonitoringDashboard,
  ContainerMetric,
  ContainerDetail,
  MetricsHistoryParams,
  MetricsHistoryResponse,
  SystemLog,
} from '@/types/monitoring.type';

export const useMonitoring = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboard = useCallback(async (): Promise<MonitoringDashboard | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getDashboard();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllContainers = useCallback(async (): Promise<ContainerMetric[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getAllContainers();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load containers');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getContainerDetail = useCallback(async (containerId: string): Promise<ContainerDetail | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getContainerDetail(containerId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load container detail');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restartContainer = useCallback(async (containerId: string, reason: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await monitoringService.restartContainer(containerId, { action: 'RESTART', reason });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to restart container');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopContainer = useCallback(async (containerId: string, reason: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await monitoringService.stopContainer(containerId, { action: 'STOP', reason });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to stop container');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startContainer = useCallback(async (containerId: string, reason: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await monitoringService.startContainer(containerId, { action: 'START', reason });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to start container');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getContainerLogs = useCallback(async (containerId: string, lines: number = 100): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await monitoringService.getContainerLogs(containerId, lines);
      return logs;
    } catch (err: any) {
      setError(err.message || 'Failed to load container logs');
      return '';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMetricsHistory = useCallback(async (params: MetricsHistoryParams): Promise<MetricsHistoryResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getMetricsHistory(params);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics history');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSystemLogs = useCallback(async (params: {
    startTime?: string;
    endTime?: string;
    level?: string;
    service?: string;
    limit?: number;
  }): Promise<SystemLog[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await monitoringService.getSystemLogs(params);
      return logs;
    } catch (err: any) {
      setError(err.message || 'Failed to load system logs');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getDashboard,
    getAllContainers,
    getContainerDetail,
    restartContainer,
    stopContainer,
    startContainer,
    getContainerLogs,
    getMetricsHistory,
    getSystemLogs,
  };
};
