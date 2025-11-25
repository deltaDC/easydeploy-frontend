"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Cpu, HardDrive, Network, Zap } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import { AppMetrics } from "@/types/app-monitoring";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AppMetricsChartProps {
  appId: string;
}

interface MetricHistory {
  timestamp: string;
  cpu: number;
  memory: number;
  networkRx: number;
  networkTx: number;
  diskRead: number;
  diskWrite: number;
}

export function AppMetricsChart({ appId }: AppMetricsChartProps) {
  const [currentMetrics, setCurrentMetrics] = useState<AppMetrics | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const maxHistoryPoints = 30; // Keep last 30 data points

  useEffect(() => {
    if (!appId) return;

    // Only create connection once
    if (eventSourceRef.current) {
      return;
    }

    const setupStream = () => {
      try {
        const eventSource = AppMonitoringService.createMetricsStream(appId);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("Metrics stream connected");
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received metrics data:", data);
            if (data.metrics) {
              const metrics = data.metrics as AppMetrics;
              console.log("Parsed metrics:", metrics);
              setCurrentMetrics(metrics);
              
              // Add to history
              const now = new Date().toLocaleTimeString();
              setHistory(prev => {
                const newHistory: MetricHistory[] = [
                  ...prev,
                  {
                    timestamp: now,
                    cpu: metrics.cpuUsage || 0,
                    memory: metrics.memoryUsage || 0,
                    networkRx: (metrics.networkRxBytes || 0) / (1024 * 1024), // Convert to MB
                    networkTx: (metrics.networkTxBytes || 0) / (1024 * 1024),
                    diskRead: (metrics.blockReadBytes || 0) / (1024 * 1024),
                    diskWrite: (metrics.blockWriteBytes || 0) / (1024 * 1024),
                  }
                ];
                // Keep only last N points
                return newHistory.slice(-maxHistoryPoints);
              });
            }
          } catch (err) {
            console.error("Error parsing metrics:", err);
          }
        };

        eventSource.onerror = (err) => {
          console.error("Metrics stream error:", err);
          setIsConnected(false);
          setError("Connection lost. Reconnecting...");
        };
      } catch (err) {
        console.error("Failed to create metrics stream:", err);
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.cpuUsage?.toFixed(1) || 0}%</div>
            <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${Math.min(currentMetrics?.cpuUsage || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.memoryUsage?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(currentMetrics?.memoryUsageBytes || 0)} / {formatBytes(currentMetrics?.memoryLimit || 0)}
            </p>
            <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300" 
                style={{ width: `${Math.min(currentMetrics?.memoryUsage || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network RX</CardTitle>
            <Network className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(currentMetrics?.networkRxBytes || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network TX</CardTitle>
            <Network className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(currentMetrics?.networkTxBytes || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Transmitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processes</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics?.pids || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">PIDs</p>
          </CardContent>
        </Card>
      </div>

      {/* CPU & Memory Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>CPU & Memory Usage</CardTitle>
              <CardDescription>Real-time usage over time</CardDescription>
            </div>
            {isConnected && (
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-600">Live</span>
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Network I/O Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Network I/O</CardTitle>
          <CardDescription>Network traffic (MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="networkRx" stroke="#8b5cf6" name="RX (MB)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="networkTx" stroke="#f97316" name="TX (MB)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disk I/O Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Disk I/O</CardTitle>
          <CardDescription>Block device activity (MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="diskRead" stroke="#06b6d4" name="Read (MB)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="diskWrite" stroke="#ec4899" name="Write (MB)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
