import api from './api';
import type { 
  DashboardOverview 
} from '@/types/dashboard';

const DASHBOARD_BASE = '/dashboard';

export const DashboardService = {
  /**
   * Get complete dashboard overview
   * GET /api/v1/dashboard
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<DashboardOverview>(DASHBOARD_BASE);
    return response.data;
  },

  /**
   * Quick actions on applications (placeholder cho tương lai)
   * Hiện tại backend chưa có endpoints này
   */
  async stopApp(appId: string): Promise<void> {
    await api.post(`/applications/${appId}/stop`);
  },

  async restartApp(appId: string): Promise<void> {
    await api.post(`/applications/${appId}/restart`);
  },

  async deleteApp(appId: string): Promise<void> {
    await api.delete(`/applications/${appId}`);
  }
};
