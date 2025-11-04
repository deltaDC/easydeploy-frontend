// Service for UC14 - Monitoring & Log Management API
import api from './api';
import type {
  MonitoringDashboard,
  ContainerMetric,
  ContainerDetail,
  ContainerAction,
  MetricsHistoryParams,
  MetricsHistoryResponse,
  AppMetric,
  SystemLog,
} from '@/types/monitoring.type';

export const monitoringService = {
  /**
   * Get monitoring dashboard overview
   * GET /api/v1/monitoring/dashboard
   */
  getDashboard: async (): Promise<MonitoringDashboard> => {
    const response = await api.get<MonitoringDashboard>('/monitoring/dashboard');
    return response.data;
  },

  /**
   * Get all containers with metrics
   * GET /api/v1/monitoring/containers
   */
  getAllContainers: async (): Promise<ContainerMetric[]> => {
    const response = await api.get<ContainerMetric[]>('/monitoring/containers');
    return response.data;
  },

  /**
   * Get container detail by ID
   * GET /api/v1/monitoring/containers/{containerId}
   */
  getContainerDetail: async (containerId: string): Promise<ContainerDetail> => {
    const response = await api.get<ContainerDetail>(`/monitoring/containers/${containerId}`);
    return response.data;
  },

  /**
   * Restart a container
   * POST /api/v1/monitoring/containers/{containerId}/restart
   */
  restartContainer: async (containerId: string, action: ContainerAction): Promise<string> => {
    const response = await api.post<string>(`/monitoring/containers/${containerId}/restart`, action);
    return response.data;
  },

  /**
   * Stop a container
   * POST /api/v1/monitoring/containers/{containerId}/stop
   */
  stopContainer: async (containerId: string, action: ContainerAction): Promise<string> => {
    const response = await api.post<string>(`/monitoring/containers/${containerId}/stop`, action);
    return response.data;
  },

  /**
   * Start a container
   * POST /api/v1/monitoring/containers/{containerId}/start
   */
  startContainer: async (containerId: string, action: ContainerAction): Promise<string> => {
    const response = await api.post<string>(`/monitoring/containers/${containerId}/start`, action);
    return response.data;
  },

  /**
   * Get container logs
   * GET /api/v1/monitoring/logs/container/{containerId}
   */
  getContainerLogs: async (containerId: string, lines: number = 100): Promise<string> => {
    const response = await api.get<string>(`/monitoring/logs/container/${containerId}`, {
      params: { lines }
    });
    return response.data;
  },

  /**
   * Get metrics history with filtering
   * GET /api/v1/monitoring/metrics/history
   */
  getMetricsHistory: async (params: MetricsHistoryParams): Promise<MetricsHistoryResponse> => {
    const response = await api.get<MetricsHistoryResponse>('/monitoring/metrics/history', {
      params
    });
    return response.data;
  },

  /**
   * Get app metrics by app ID
   * GET /api/v1/monitoring/apps/{appId}/metrics
   */
  getAppMetrics: async (appId: string): Promise<ContainerMetric> => {
    const response = await api.get<ContainerMetric>(`/monitoring/apps/${appId}/metrics`);
    return response.data;
  },

  /**
   * Get system logs from backend
   * GET /api/v1/monitoring/logs/system
   */
  getSystemLogs: async (params: {
    startTime?: string;
    endTime?: string;
    level?: string;
    service?: string;
    limit?: number;
  }): Promise<SystemLog[]> => {
    const response = await api.get<SystemLog[]>('/monitoring/logs/system', { params });
    return response.data;
  },

  /**
   * Get Prometheus metrics
   * GET /api/v1/monitoring/metrics/prometheus
   */
  getPrometheusMetrics: async (): Promise<import('@/types/monitoring.type').PrometheusMetrics> => {
    const response = await api.get<import('@/types/monitoring.type').PrometheusMetrics>('/monitoring/metrics/prometheus');
    return response.data;
  },
};

