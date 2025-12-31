"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Database, Zap, HardDrive, Network } from "lucide-react";
import DatabaseMonitoringService, { DatabaseMetrics } from "@/services/database-monitoring.service";
import { LiquidGauge } from "@/components/database-detail/LiquidGauge";

interface DatabaseMetricsChartProps {
  databaseId: string;
}

export function DatabaseMetricsChart({ databaseId }: DatabaseMetricsChartProps) {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const maxDataPoints = 20;

  useEffect(() => {
    // Initial fetch
    const fetchInitialMetrics = async () => {
      try {
        const data = await DatabaseMonitoringService.getDatabaseMetrics(databaseId);
        setMetrics(data);
      } catch (err: any) {
        console.error("Failed to fetch initial metrics:", err);
      }
    };
    fetchInitialMetrics();

    // Create SSE connection
    if (eventSourceRef.current) {
      return;
    }

    try {
      const eventSource = DatabaseMonitoringService.createMetricsStream(databaseId);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("Database metrics SSE connection opened");
        setIsConnected(true);
        setError(null);
      };

      eventSource.addEventListener("connection", (event: MessageEvent) => {
        console.log("Connection event received:", event.data);
        setIsConnected(true);
        setError(null);
      });

      eventSource.addEventListener("database-metrics", (event: MessageEvent) => {
        try {
          const data: DatabaseMetrics = JSON.parse(event.data);
          setMetrics(data);
          setIsConnected(true); // Also set connected when receiving data
          setError(null);

          // Add to chart data
          setChartData(prev => {
            const newData = [...prev, {
              time: new Date(data.timestamp).toLocaleTimeString(),
              cpu: data.cpuUsage || 0,
              memory: data.memoryUsagePercent || 0,
              connections: data.activeConnections || 0,
              qps: data.queriesPerSecond || 0,
              storage: data.storageUsagePercent || 0,
            }];
            return newData.slice(-maxDataPoints);
          });
        } catch (err) {
          console.error("Error parsing database metrics:", err);
        }
      });

      eventSource.addEventListener("error", (event: MessageEvent) => {
        console.error("SSE error event:", event);
        setError("Error receiving metrics");
      });

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);
        setError("Connection lost");
      };
    } catch (err) {
      console.error("Error creating database metrics stream:", err);
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => setError("Failed to connect to metrics stream"));
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [databaseId]);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading database metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Live metrics' : 'Disconnected'}
          </span>
        </div>
        {error && (
          <Badge variant="destructive" className="text-xs">{error}</Badge>
        )}
      </div>

      {/* Bento Grid Layout - Different sized boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              CPU Usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        {/* Memory with Liquid Gauge - Larger box */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Memory
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <LiquidGauge
              value={metrics.memoryUsagePercent || 0}
              label="Memory"
              size="md"
              color="#3b82f6"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {formatBytes(metrics.memoryUsage)} / {formatBytes(metrics.memoryLimit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConnections || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              / {metrics.maxConnections || 0} max
            </p>
          </CardContent>
        </Card>

        {/* Storage with Liquid Gauge - Larger box */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <LiquidGauge
              value={metrics.diskUsagePercent || metrics.storageUsagePercent || 0}
              label="Storage"
              size="md"
              color="#10b981"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {formatBytes(metrics.diskUsageBytes || metrics.databaseSizeBytes || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Queries/Sec</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.queriesPerSecond?.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {metrics.totalQueries?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Avg Query Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(metrics.avgQueryTimeMs || metrics.avgQueryTime || 0).toFixed(2)} ms</div>
            <p className="text-xs text-muted-foreground mt-2">
              Slow queries: {metrics.slowQueries || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cache Hit Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.cacheHitRatio?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {formatUptime(metrics.uptimeSeconds)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>CPU and Memory usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    {/* Gradient for CPU */}
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    {/* Gradient for Memory */}
                    <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    cursor={{ stroke: "rgba(236, 72, 153, 0.5)", strokeWidth: 2 }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#8b5cf6" 
                    fill="url(#cpuGradient)" 
                    strokeWidth={2}
                    name="CPU %" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#3b82f6" 
                    fill="url(#memoryGradient)" 
                    strokeWidth={2}
                    name="Memory %" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Connections and Queries per second</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="connections" stroke="#10b981" name="Active Connections" />
                  <Line type="monotone" dataKey="qps" stroke="#f59e0b" name="Queries/Sec" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tables</p>
              <p className="text-lg font-semibold">{metrics.numberOfTables || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Indexes</p>
              <p className="text-lg font-semibold">{metrics.numberOfIndexes || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Table Size</p>
              <p className="text-lg font-semibold">{formatBytes(metrics.totalTableSize)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Index Size</p>
              <p className="text-lg font-semibold">{formatBytes(metrics.totalIndexSize)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${metrics.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="font-medium">{metrics.isHealthy ? 'Healthy' : 'Unhealthy'}</p>
              <p className="text-sm text-muted-foreground">{metrics.healthMessage}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Response time: {metrics.responseTimeMs} ms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
