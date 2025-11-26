export interface AppMetrics {
  containerId: string;
  containerName: string;
  appId: string;
  appName: string;
  status: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  memoryUsageBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  blockReadBytes: number;
  blockWriteBytes: number;
  pids: number;
  uptime: number | null;
  lastUpdated: string;
}

export interface AppMetricsStreamData {
  timestamp: number;
  metrics?: AppMetrics;
  status?: string;
}

export interface AppLogsStreamData {
  timestamp: number;
  logs: string;
}

export interface AppContainerAction {
  appId: string;
  action: 'start' | 'stop' | 'restart';
}
