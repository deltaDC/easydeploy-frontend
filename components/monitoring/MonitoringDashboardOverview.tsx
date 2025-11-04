"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitoringDashboard } from "@/types/monitoring.type";
import { Activity, Server, AlertTriangle, Cpu, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MonitoringDashboardOverviewProps {
  dashboard: MonitoringDashboard;
}

function MonitoringDashboardOverview({ dashboard }: MonitoringDashboardOverviewProps) {
  const containerHealthPercentage = dashboard.totalContainers > 0
    ? (dashboard.runningContainers / dashboard.totalContainers) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Containers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.totalContainers}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs bg-green-500">
              {dashboard.runningContainers} Running
            </Badge>
            {dashboard.stoppedContainers > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dashboard.stoppedContainers} Stopped
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Container Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Container Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{containerHealthPercentage.toFixed(1)}%</div>
          <Progress value={containerHealthPercentage} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {dashboard.runningContainers} of {dashboard.totalContainers} healthy
          </p>
        </CardContent>
      </Card>

      {/* Average CPU Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.avgCpuUsage.toFixed(1)}%</div>
          <Progress 
            value={dashboard.avgCpuUsage} 
            className={`mt-2 h-2 ${dashboard.avgCpuUsage > 80 ? "[&>div]:bg-red-500" : dashboard.avgCpuUsage > 60 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {dashboard.avgCpuUsage > 80 ? "High usage detected" : "Normal"}
          </p>
        </CardContent>
      </Card>

      {/* Average Memory Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Memory Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.avgMemoryUsage.toFixed(1)}%</div>
          <Progress 
            value={dashboard.avgMemoryUsage} 
            className={`mt-2 h-2 ${dashboard.avgMemoryUsage > 90 ? "[&>div]:bg-red-500" : dashboard.avgMemoryUsage > 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {dashboard.avgMemoryUsage > 90 ? "Critical level" : "Normal"}
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {dashboard.activeAlerts && dashboard.activeAlerts.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
              Active Alerts ({dashboard.activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.activeAlerts.map((alert, index) => (
                <div key={index} className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Memoize to prevent re-render if dashboard metrics haven't changed
export default memo(MonitoringDashboardOverview, (prev, next) => {
  return (
    prev.dashboard.totalContainers === next.dashboard.totalContainers &&
    prev.dashboard.runningContainers === next.dashboard.runningContainers &&
    prev.dashboard.stoppedContainers === next.dashboard.stoppedContainers &&
    prev.dashboard.avgCpuUsage === next.dashboard.avgCpuUsage &&
    prev.dashboard.avgMemoryUsage === next.dashboard.avgMemoryUsage &&
    prev.dashboard.activeAlerts === next.dashboard.activeAlerts
  );
});
