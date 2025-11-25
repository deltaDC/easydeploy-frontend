"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, MemoryStick, Clock } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import { AppMetricsStreamData } from "@/types/app-monitoring";

interface AppMetricsCardProps {
  appId: string;
}

export function AppMetricsCard({ appId }: AppMetricsCardProps) {
  const [metricsData, setMetricsData] = useState<AppMetricsStreamData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only create connection once per component lifecycle
    if (eventSourceRef.current) {
      return;
    }

    const setupStream = () => {
      try {
        const eventSource = AppMonitoringService.createMetricsStream(appId);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.addEventListener("app-metrics", (event: MessageEvent) => {
          try {
            const data: AppMetricsStreamData = JSON.parse(event.data);
            setMetricsData(data);
          } catch (err) {
            console.error("Error parsing metrics data:", err);
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          setError("Connection lost. Reconnecting...");
        };
      } catch (err) {
        console.error("Error creating metrics stream:", err);
        setError("Failed to connect to metrics stream");
      }
    };

    setupStream();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [appId]);

  const formatUptime = (seconds: number | null): string => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "exited":
      case "stopped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "created":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Runtime Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metricsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Runtime Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metricsData.status === "no_container") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Runtime Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No container running for this application</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = metricsData.metrics;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Runtime Metrics
          </CardTitle>
          {isConnected && (
            <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
        </div>
        <CardDescription>Real-time container performance</CardDescription>
      </CardHeader>
      <CardContent>
        {metrics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(metrics.status)}>{metrics.status}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {metrics.cpuUsage?.toFixed(1) || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(metrics.cpuUsage || 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MemoryStick className="h-4 w-4" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {metrics.memoryUsage?.toFixed(1) || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(metrics.memoryUsage || 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatUptime(metrics.uptime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-right">
              Container: {metrics.containerName || metrics.containerId?.substring(0, 12)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
