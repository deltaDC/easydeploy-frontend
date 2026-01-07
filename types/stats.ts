// Stats Module TypeScript Types - Mapping với Backend DTOs

// System Stats Types

export interface SystemStatsSummary {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  runningApplications: number;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  successRate: number;
  avgDeploymentDurationSeconds: number;
  totalWebhookEvents: number;
  successfulWebhookEvents: number;
  systemUptime?: number;
  avgResponseTime?: number;
  totalUsersChangePercent?: number;
  runningAppsChangePercent?: number;
  successRateChangePercent?: number;
  systemUptimeChangePercent?: number;
}

export interface StatsTrendPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface SystemOverviewResponse {
  summary: SystemStatsSummary;
  trends: StatsTrendPoint[];
  lastUpdated: string;
}

// Trend Types

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface StatsTrendResponse {
  type: 'deployments' | 'users' | 'webhooks';
  timeRange: string;
  dataPoints: TrendDataPoint[];
}

//  Webhook Stats Types

export interface WebhookStatsResponse {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  timeRange: string;
  eventsByType?: Record<string, number>;
}

// User Stats Types

export interface UserPersonalStatsResponse {
  totalApplications: number;
  runningApplications: number;
  stoppedApplications: number;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  successRate: number;
  avgDeploymentDurationSeconds: number;
}

// Deployment History Types

export interface DeploymentHistory {
  id: string;
  appId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  commitSha: string | null;
  branch: string | null;
  createdAt: string;
}

// Request Types

export interface StatsTimeRangeRequest {
  timeRange?: 'day' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  userId?: string;
  applicationId?: string;
  status?: string;
}

export interface DeploymentFilters {
  timeRange?: 'day' | 'month' | 'year' | 'custom';
  userId?: string;
  applicationId?: string;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';
  startDate?: string;
  endDate?: string;
}


// API Response Wrapper

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Top Apps Types
export interface TopAppDTO {
  appId: string;
  appName: string;
  deploymentCount: number;
  successfulDeployments: number;
  successRate: number;
  userId: string | null;
}

export interface TopAppResponse {
  topApps: TopAppDTO[];
}

// Hourly Stats Types
export interface HourlyStatDTO {
  hour: number; // 0-23
  deploymentCount: number;
  successfulDeployments: number;
  successRate: number;
}

export interface HourlyStatsResponse {
  hourlyStats: HourlyStatDTO[];
}

// Deployment Status Distribution Types
export interface DeploymentStatusDistributionResponse {
  statusCounts: Record<string, number>;
  timeRange: string;
}

// Branch Stats Types
export interface BranchStatDTO {
  branchName: string;
  deploymentCount: number;
}

export interface BranchStatsResponse {
  branches: BranchStatDTO[];
  timeRange: string;
}

