import api from "./api";

export interface DatabaseMetrics {
  // Basic Info
  databaseId: string;
  databaseName: string;
  databaseType: string;
  status: string;
  containerId: string;
  
  // Connection Metrics
  activeConnections: number;
  maxConnections: number;
  connectionPoolUsage: number;
  totalConnectionsCreated: number;
  connectionErrors: number;
  
  // Performance Metrics
  queriesPerSecond: number;
  totalQueries: number;
  avgQueryTime: number;
  avgQueryTimeMs?: number; // Optional - same as avgQueryTime, provided for backwards compatibility
  slowQueries: number;
  cacheHitRatio: number;
  
  // Query Editor Metrics (from sliding window tracker)
  queryEditorQueriesTotal?: number;
  queryEditorSelectQueries?: number;
  queryEditorModifyQueries?: number;
  queryEditorQPS?: number;
  queryEditorAvgTimeMs?: number;
  
  // Resource Usage
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  memoryUsagePercent: number;
  
  // Disk I/O
  diskReadBytes: number;
  diskWriteBytes: number;
  diskReadBytesPerSec: number;
  diskWriteBytesPerSec: number;
  
  // Network I/O
  networkRxBytes: number;
  networkTxBytes: number;
  networkRxBytesPerSec: number;
  networkTxBytesPerSec: number;
  
  // Storage Metrics
  databaseSizeBytes: number;
  totalTableSize: number;
  totalIndexSize: number;
  numberOfTables: number;
  numberOfIndexes: number;
  storageUsagePercent: number;
  
  // Disk Usage (from container filesystem)
  diskUsageBytes?: number;      // Dung lượng disk đã sử dụng (bytes)
  diskTotalBytes?: number;       // Dung lượng disk tổng (bytes)
  diskUsagePercent?: number;     // Phần trăm sử dụng disk
  
  // Health Metrics
  uptimeSeconds: number;
  lastHealthCheck: string;
  isHealthy: boolean;
  healthMessage: string;
  responseTimeMs: number;
  
  // Replication
  replicationEnabled: boolean;
  replicationLagSeconds: number;
  replicationStatus: string;
  
  // Timestamp
  timestamp: string;
  
  // Additional Info
  version: string;
  charset: string;
  collation: string;
}

class DatabaseMonitoringService {
  /**
   * Get current database metrics (one-time fetch)
   */
  async getDatabaseMetrics(databaseId: string): Promise<DatabaseMetrics> {
    const response = await api.get(`/databases/${databaseId}/metrics`);
    return response.data;
  }

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    // Try Zustand persist key first
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token) {
          return parsed.state.token;
        }
      } catch (e) {
        console.warn("Failed to parse auth storage:", e);
      }
    }
    
    // Fallback to direct token key
    return localStorage.getItem("auth_token");
  }

  /**
   * Create SSE connection for real-time database metrics
   */
  createMetricsStream(databaseId: string): EventSource {
    const token = this.getAuthToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/${databaseId}/metrics/stream`;
    
    // EventSource doesn't support custom headers, so we pass token as query param
    const urlWithAuth = token ? `${url}?auth_token=${encodeURIComponent(token)}` : url;
    
    console.log("Creating metrics stream:", urlWithAuth.substring(0, 100) + "...");
    return new EventSource(urlWithAuth);
  }

  /**
   * Create SSE connection for real-time database logs
   */
  createLogsStream(databaseId: string, maxLines: number = 100): EventSource {
    const token = this.getAuthToken();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/${databaseId}/logs/stream?maxLines=${maxLines}`;
    
    const urlWithAuth = token ? `${url}&auth_token=${encodeURIComponent(token)}` : url;
    
    console.log("Creating logs stream:", urlWithAuth.substring(0, 100) + "...");
    return new EventSource(urlWithAuth);
  }

  /**
   * Start database container
   */
  async startDatabase(databaseId: string): Promise<string> {
    const response = await api.post(`/databases/${databaseId}/start`);
    return response.data;
  }

  /**
   * Stop database container
   */
  async stopDatabase(databaseId: string): Promise<string> {
    const response = await api.post(`/databases/${databaseId}/stop`);
    return response.data;
  }

  /**
   * Restart database container
   */
  async restartDatabase(databaseId: string): Promise<string> {
    const response = await api.post(`/databases/${databaseId}/restart`);
    return response.data;
  }
}

export default new DatabaseMonitoringService();
