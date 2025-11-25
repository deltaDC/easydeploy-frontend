"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Network, Zap } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import type { AppMetrics } from "@/types/app-monitoring";

interface AppMetricsChartCardProps {
  appId: string;
}

interface MetricsDataPoint {
  time: string;
  cpu: number;
  memory: number;
}

interface NetworkDataPoint {
  time: string;
  rx: number; // KB/s
  tx: number; // KB/s
}

export function AppMetricsChartCard({ appId }: AppMetricsChartCardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);
  const [chartData, setChartData] = useState<MetricsDataPoint[]>([]);
  const [networkChartData, setNetworkChartData] = useState<NetworkDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastNetworkTotalsRef = useRef<{ rx: number; tx: number; timestamp: number } | null>(null);
  const maxDataPoints = 30; // Keep last 30 data points

    const chartYAxisMax = useMemo(() => {
      if (!chartData.length) return 100;
      const peak = chartData.reduce((max, point) => {
        return Math.max(max, point.cpu ?? 0, point.memory ?? 0);
      }, 0);
      if (peak <= 5) return 10;
      if (peak >= 90) return 100;
      return Math.min(100, Math.ceil(peak * 1.25));
    }, [chartData]);

    const networkYAxisMax = useMemo(() => {
      if (!networkChartData.length) return 10;
      const peak = networkChartData.reduce((max, point) => {
        return Math.max(max, point.rx ?? 0, point.tx ?? 0);
      }, 0);
      if (peak <= 10) return 10;
      return Math.ceil(peak * 1.3);
    }, [networkChartData]);

    const latestNetworkRates = useMemo(() => {
      if (!networkChartData.length) return { rx: 0, tx: 0 };
      return networkChartData[networkChartData.length - 1];
    }, [networkChartData]);

  useEffect(() => {
    // Reset state when appId changes
    const resetState = () => {
      setNetworkChartData([]);
      lastNetworkTotalsRef.current = null;
    };
    resetState();

    // Test: Fetch one-time metrics first to see if API works
    const testFetch = async () => {
      try {
        console.log("🧪 Testing one-time metrics fetch...");
        const data = await AppMonitoringService.getAppMetrics(appId);
        console.log("✅ One-time fetch successful:", data);
        setMetrics(data);
      } catch (err: any) {
        console.error("❌ One-time fetch failed:", err.response?.data || err.message);
      }
    };
    testFetch();

    // Only create EventSource once
    if (eventSourceRef.current) {
      return;
    }

    console.log("Creating metrics SSE connection for app:", appId);
    const eventSource = AppMonitoringService.createMetricsStream(appId);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("Metrics SSE connection opened");
      setIsConnected(true);
      setError(null);
    };

    // Listen to "app-metrics" event (not default "message")
    eventSource.addEventListener("app-metrics", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("✅ Received SSE metrics data:", data);
        
        // Backend sends { timestamp, metrics }
        const metricsData = data.metrics || data;
        
        // Check if data has required fields
        if (!metricsData.cpuUsage && metricsData.cpuUsage !== 0) {
          console.warn("⚠️ Data missing cpuUsage field:", metricsData);
        }
        
        setMetrics(metricsData);
        
        // Add to chart data
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        
        setChartData(prev => {
          const newData = [
            ...prev,
            {
              time: timeStr,
              cpu: metricsData.cpuUsage || 0,
              memory: metricsData.memoryUsage || 0,
            }
          ];
          
          // Keep only last maxDataPoints
          return newData.slice(-maxDataPoints);
        });

        // Calculate network throughput (KB/s) using cumulative totals
        if (typeof metricsData.networkRxBytes === 'number' && typeof metricsData.networkTxBytes === 'number') {
          const currentTotals = {
            rx: metricsData.networkRxBytes,
            tx: metricsData.networkTxBytes,
            timestamp: now.getTime(),
          };

          const previousTotals = lastNetworkTotalsRef.current;
          if (previousTotals) {
            const deltaTime = (currentTotals.timestamp - previousTotals.timestamp) / 1000; // seconds
            if (deltaTime > 0) {
              const rxRate = Math.max(0, (currentTotals.rx - previousTotals.rx) / 1024 / deltaTime);
              const txRate = Math.max(0, (currentTotals.tx - previousTotals.tx) / 1024 / deltaTime);

              setNetworkChartData(prev => {
                const newData = [
                  ...prev,
                  {
                    time: timeStr,
                    rx: parseFloat(rxRate.toFixed(2)),
                    tx: parseFloat(txRate.toFixed(2)),
                  }
                ];
                return newData.slice(-maxDataPoints);
              });
            }
          }

          lastNetworkTotalsRef.current = currentTotals;
        }

      } catch (err) {
        console.error("❌ Error parsing SSE metrics data:", err, "Raw data:", event.data);
      }
    });

    eventSource.onerror = (err) => {
      console.error("Metrics SSE error:", err);
      setIsConnected(false);
      setError("Connection lost. Reconnecting...");
      
      // Auto reconnect
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        setError(null);
      }, 3000);
    };

    return () => {
      if (eventSourceRef.current) {
        console.log("Closing metrics SSE connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      lastNetworkTotalsRef.current = null;
      setNetworkChartData([]);
    };
  }, [appId]);

  const formatBytes = (bytes: number | null | undefined): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatThroughput = (kbPerSecond: number): string => {
    if (!kbPerSecond || kbPerSecond <= 0) return "0 KB/s";
    if (kbPerSecond >= 1024) {
      return `${(kbPerSecond / 1024).toFixed(2)} MB/s`;
    }
    return `${kbPerSecond.toFixed(2)} KB/s`;
  };

  const formatUptime = (seconds: number | null | undefined): string => {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Runtime Metrics</CardTitle>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
              </div>
            )}
          </div>
          <CardDescription>Real-time container performance</CardDescription>
        </CardHeader>
      </Card>


         {/* Container Info */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Container Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${metrics.status?.toLowerCase().includes('running') ? 'text-green-600' : 'text-gray-600'}`}>
                {metrics.status || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium">{formatUptime(metrics.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Container:</span>
              <span className="font-mono text-xs break-all">{metrics.containerName || metrics.containerId || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      
      {/* Error Message */}
      {error && (
        <Card className="border-yellow-500">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          {/* CPU */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Cpu className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cpuUsage?.toFixed(1) || 0}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.cpuUsage || 0, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Memory */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-green-600">
                <Zap className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.memoryUsage?.toFixed(1) || 0}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatBytes(metrics.memoryUsageBytes)} / {formatBytes(metrics.memoryLimit)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.memoryUsage || 0, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Network RX */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-purple-600">
                <Network className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Network RX</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatThroughput(latestNetworkRates.rx)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total {formatBytes(metrics.networkRxBytes)}
              </div>
            </CardContent>
          </Card>

          {/* Network TX */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Network className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Network TX</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatThroughput(latestNetworkRates.tx)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total {formatBytes(metrics.networkTxBytes)}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memory Usage</CardTitle>
            <CardDescription>Real-time usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, chartYAxisMax]}
                    label={{ value: '%', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="CPU %"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Memory %"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Throughput Chart */}
      {networkChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Network Throughput</CardTitle>
            <CardDescription>KB/s received vs transmitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, networkYAxisMax]}
                    label={{ value: 'KB/s', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} KB/s`} />
                  <Legend />
                  <Line type="monotone" dataKey="rx" stroke="#8b5cf6" strokeWidth={2} name="RX KB/s" dot={false} />
                  <Line type="monotone" dataKey="tx" stroke="#f97316" strokeWidth={2} name="TX KB/s" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

     
    </div>
  );
}
