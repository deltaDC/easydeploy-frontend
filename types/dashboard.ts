// Dashboard statistics types - mapping với DashboardStatsResponse.java
export interface DashboardStats {
  totalApplications: number;
  runningApplications: number;
  stoppedApplications: number;
  failedApplications: number;
  deployingApplications: number;
}

// Deployment status enum - mapping với DeploymentStatus.java
export type DeploymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';

// Recent application type - mapping với RecentApplicationDto.java
export interface RecentApplication {
  id: string; // UUID from backend
  name: string;
  status: DeploymentStatus;
  containerStatus?: string; // Docker container status: running, exited, etc.
  publicUrl?: string;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
}

// System metrics - mapping với SystemMetricsDTO.java
export interface SystemMetrics {
  cpuUsage: number;
  ramUsage: number;
}

export interface DeploymentFrequencyDataPoint {
  timestamp: string; // ISO date string
  value: number;
  label: string;
}

// Deployment frequency data - mapping với DeploymentFrequencyData.java
export interface DeploymentFrequencyData {
  dataPoints: DeploymentFrequencyDataPoint[];
}

export interface RecentDatabase {
  id: string; 
  name: string;
  type: string; 
  status: string; 
  containerStatus?: string; 
  version?: string;
  updatedAt: string; 
  createdAt: string; 
}

// Dashboard overview - mapping với DashboardResponse.java
export interface DashboardOverview {
  stats: DashboardStats;
  recentApplications: RecentApplication[];
  recentDatabases?: RecentDatabase[];
  lastUpdated: string; 
  username?: string;
  systemMetrics?: SystemMetrics;
  deploymentFrequency?: DeploymentFrequencyData;
}
