import api from "./api";
import { AppMetrics } from "@/types/app-monitoring";

class AppMonitoringService {
  /**
   * Get current metrics for an app (one-time fetch)
   */
  async getAppMetrics(appId: string): Promise<AppMetrics> {
    const response = await api.get(`/monitoring/apps/${appId}/metrics`);
    return response.data;
  }

  /**
   * Create SSE connection for real-time app metrics
   */
  createMetricsStream(appId: string): EventSource {
    // Get token from Zustand persist storage
    let token = "";
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token || "";
        } catch (e) {
          console.error("Failed to parse auth storage:", e);
        }
      }
      // Fallback
      if (!token) {
        token = localStorage.getItem("auth_token") || "";
      }
    }
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/monitoring/apps/${appId}/metrics/stream`;
    const urlWithAuth = `${url}?auth_token=${encodeURIComponent(token)}`;
    
    return new EventSource(urlWithAuth);
  }

  /**
   * Create SSE connection for real-time app logs
   */
  createLogsStream(appId: string, lines: number = 100): EventSource {
    // Get token from Zustand persist storage
    let token = "";
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token || "";
        } catch (e) {
          console.error("Failed to parse auth storage:", e);
        }
      }
      // Fallback
      if (!token) {
        token = localStorage.getItem("auth_token") || "";
      }
    }
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/monitoring/apps/${appId}/logs/stream`;
    const urlWithAuth = `${url}?lines=${lines}&auth_token=${encodeURIComponent(token)}`;
    
    return new EventSource(urlWithAuth);
  }

  /**
   * Restart app container
   */
  async restartApp(appId: string): Promise<string> {
    const response = await api.post(`/monitoring/apps/${appId}/restart`);
    return response.data;
  }

  /**
   * Stop app container
   */
  async stopApp(appId: string): Promise<string> {
    const response = await api.post(`/monitoring/apps/${appId}/stop`);
    return response.data;
  }

  /**
   * Start app container
   */
  async startApp(appId: string): Promise<string> {
    const response = await api.post(`/monitoring/apps/${appId}/start`);
    return response.data;
  }
}

export default new AppMonitoringService();
