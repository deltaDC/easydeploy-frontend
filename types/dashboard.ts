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

// Dashboard overview - mapping với DashboardResponse.java
export interface DashboardOverview {
  stats: DashboardStats;
  recentApplications: RecentApplication[];
  lastUpdated: string; // ISO date string
}
