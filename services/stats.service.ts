import api from './api';
import type {
  SystemOverviewResponse,
  StatsTrendResponse,
  WebhookStatsResponse,
  UserPersonalStatsResponse,
  DeploymentHistory,
  DeploymentFilters,
  ApiResponse,
  TopAppResponse,
  HourlyStatsResponse,
  DeploymentStatusDistributionResponse,
  BranchStatsResponse,
} from '@/types/stats';

const SYSTEM_STATS_BASE = '/system/stats';

export const StatsService = {
  async getSystemOverview(timeRange: string = 'month', startDate?: string, endDate?: string): Promise<SystemOverviewResponse> {
    const params: any = { timeRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<SystemOverviewResponse>>(
      `${SYSTEM_STATS_BASE}/overview`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      throw new Error('Invalid response structure from getSystemOverview');
    }
    return data;
  },

  async getTrend(
    type: 'deployments' | 'users' | 'webhooks',
    timeRange: string = 'month',
    startDate?: string,
    endDate?: string
  ): Promise<StatsTrendResponse> {
    const params: any = { type, range: timeRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get<ApiResponse<StatsTrendResponse>>(
      `${SYSTEM_STATS_BASE}/trend`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      throw new Error('Invalid response structure from getTrend');
    }
    return data;
  },

  async getPreviousPeriodTrend(
    type: 'deployments' | 'users' | 'webhooks',
    timeRange: string = 'week'
  ): Promise<StatsTrendResponse> {
    const response = await api.get<ApiResponse<StatsTrendResponse>>(
      `${SYSTEM_STATS_BASE}/trend/previous`,
      {
        params: { type, range: timeRange },
      }
    );
    return response.data.data;
  },

  async getWebhookStats(timeRange: string = 'week', startDate?: string, endDate?: string): Promise<WebhookStatsResponse> {
    const params: any = { timeRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<WebhookStatsResponse>>(
      `${SYSTEM_STATS_BASE}/webhooks`,
      { params }
    );
    return response.data.data;
  },

  async getDeployments(filters: DeploymentFilters = {}): Promise<DeploymentHistory[]> {
    const params: any = {};
    params.timeRange = filters.timeRange || 'month';
    if (filters.userId) params.userId = filters.userId;
    if (filters.applicationId) params.applicationId = filters.applicationId;
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    
    const response = await api.get<ApiResponse<DeploymentHistory[]>>(
      `${SYSTEM_STATS_BASE}/deployments`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      return [];
    }
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  },

  async getTopApps(timeRange: string = 'week', limit: number = 5, startDate?: string, endDate?: string): Promise<TopAppResponse> {
    const params: any = { timeRange, limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<TopAppResponse>>(
      `${SYSTEM_STATS_BASE}/top-apps`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      throw new Error('Invalid response structure from getTopApps');
    }
    return data;
  },

  async getHourlyStats(timeRange: string = 'week', startDate?: string, endDate?: string): Promise<HourlyStatsResponse> {
    const params: any = { timeRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<HourlyStatsResponse>>(
      `${SYSTEM_STATS_BASE}/hourly-stats`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      throw new Error('Invalid response structure from getHourlyStats');
    }
    return data;
  },

  async getDeploymentStatusDistribution(timeRange: string = 'week', startDate?: string, endDate?: string): Promise<DeploymentStatusDistributionResponse> {
    const params: any = { timeRange };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<DeploymentStatusDistributionResponse>>(
      `${SYSTEM_STATS_BASE}/deployment-status-distribution`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      throw new Error('Invalid response structure from getDeploymentStatusDistribution');
    }
    return data;
  },

  async getBranchStats(timeRange: string = 'week', limit: number = 10, startDate?: string, endDate?: string): Promise<BranchStatsResponse> {
    const params: any = { timeRange, limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get<ApiResponse<BranchStatsResponse>>(
      `${SYSTEM_STATS_BASE}/branch-stats`,
      { params }
    );
    const data = response.data?.data ?? response.data;
    if (!data) {
      throw new Error('Invalid response structure from getBranchStats');
    }
    return data;
  },

};

