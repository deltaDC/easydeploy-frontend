// Types for Monitoring & Log Management

export interface MonitoringDashboard {
  totalContainers: number;
  runningContainers: number;
  stoppedContainers: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  recentMetrics: AppMetric[];
  activeAlerts: string[];
  lastUpdated: string;
}

export interface ContainerMetric {
  containerId: string;
  containerName: string;
  appId: string;
  appName: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting' | 'dead';
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  lastUpdated: string;
}

export interface ContainerDetail {
  containerId: string;
  containerName: string;
  appId: string;
  appName: string;
  status: string;
  image: string;
  uptime: number;
  createdAt: string;
  ports: Record<string, string>;
  environment: Record<string, string>;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
  };
  logs: string;
}

export interface ContainerAction {
  action: 'RESTART' | 'STOP' | 'START';
  reason: string;
}

export interface AppMetric {
  id: string;
  appId: string;
  cpu: number;
  memory: number;
  uptime: number;
  timestamp: string;
}

export interface MetricsHistoryParams {
  startTime?: string;
  endTime?: string;
  containerId?: string;
  page?: number;
  size?: number;
}

export interface MetricsHistoryResponse {
  content: AppMetric[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface SystemLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: string;
  message: string;
  containerId?: string;
}

// Prometheus Metrics Types
export interface PrometheusMetrics {
  jvmMetrics: JvmMetrics;
  httpMetrics: HttpMetrics;
  systemMetrics: SystemMetrics;
  cpuHistory: TimeSeriesData[];
  memoryHistory: TimeSeriesData[];
  requestRateHistory: TimeSeriesData[];
}

export interface JvmMetrics {
  heapUsed: number;
  heapMax: number;
  heapUsagePercent: number;
  nonHeapUsed: number;
  threadsLive: number;
  threadsPeak: number;
  gcPauseTime: number;
  gcCount: number;
}

export interface HttpMetrics {
  totalRequests: number;
  requestsPerSecond: number;
  avgResponseTime: number;
  maxResponseTime: number;
  successCount: number;
  clientErrorCount: number;
  serverErrorCount: number;
}

export interface SystemMetrics {
  systemCpuUsage: number;
  processCpuUsage: number;
  uptimeSeconds: number;
  activeConnections: number;
  maxConnections: number;
  systemUptimePercent?: number;
  diskUsage?: number;
  networkIO?: string;
  cpuTrend?: string;
  cpuChange?: string;
  memoryTrend?: string;
  memoryChange?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

