"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Activity, Cpu, Zap, Network, Clock, Server } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import type { AppMetrics } from "@/types/app-monitoring";

interface MetricsTabProps {
  appId: string;
}

interface MetricsDataPoint {
  time: string;
  cpu: number;
  memory: number;
}

interface NetworkDataPoint {
  time: string;
  rx: number;
  tx: number;
}

// Glass Metric Card
function GlassMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  percentage,
  subtitle,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  color: string;
  percentage?: number;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 shadow-sage-glow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")}`} strokeWidth={1.5} />
        </div>
        <span className="text-xs text-charcoal/50">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-charcoal">{value}</span>
        {unit && <span className="text-sm text-charcoal/50">{unit}</span>}
      </div>
      {percentage !== undefined && (
        <div className="mt-2">
          <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${color}`}
            />
          </div>
        </div>
      )}
      {subtitle && <p className="text-xs text-charcoal/50 mt-2">{subtitle}</p>}
    </motion.div>
  );
}

// Memory Gauge Chart
function MemoryGauge({ percentage, used, total }: { percentage: number; used: string; total: string }) {
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference * 0.75; // 270 degree arc

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 shadow-sage-glow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Zap className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
        </div>
        <span className="text-xs text-charcoal/50">Memory Usage</span>
      </div>
      
      <div className="relative w-36 h-36 mx-auto">
        {/* Background arc */}
        <svg className="w-full h-full -rotate-135" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(146, 175, 173, 0.2)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="url(#emeraldGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-charcoal">{percentage.toFixed(1)}%</span>
          <span className="text-xs text-charcoal/50">Used</span>
        </div>
        
        {/* Glowing dot indicator */}
        <motion.div
          className="gauge-dot absolute"
          style={{
            left: `${50 + 40 * Math.cos((-135 + percentage * 2.7) * (Math.PI / 180))}%`,
            top: `${50 + 40 * Math.sin((-135 + percentage * 2.7) * (Math.PI / 180))}%`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            boxShadow: [
              "0 0 10px rgba(16, 185, 129, 0.6)",
              "0 0 20px rgba(16, 185, 129, 0.8)",
              "0 0 10px rgba(16, 185, 129, 0.6)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-charcoal">
          <span className="font-medium">{used}</span>
          <span className="text-charcoal/50"> / {total}</span>
        </p>
      </div>
    </motion.div>
  );
}

export function MetricsTab({ appId }: MetricsTabProps) {
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);
  const [chartData, setChartData] = useState<MetricsDataPoint[]>([]);
  const [networkChartData, setNetworkChartData] = useState<NetworkDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastNetworkTotalsRef = useRef<{ rx: number; tx: number; timestamp: number } | null>(null);
  const maxDataPoints = 30;

  useEffect(() => {
    // Reset on mount/appId change
    lastNetworkTotalsRef.current = null;

    // Initial fetch
    const testFetch = async () => {
      try {
        const data = await AppMonitoringService.getAppMetrics(appId);
        setMetrics(data);
      } catch (err: any) {
        console.error("Initial metrics fetch failed:", err);
      }
    };
    testFetch();

    // SSE connection
    if (eventSourceRef.current) return;

    const eventSource = AppMonitoringService.createMetricsStream(appId);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.addEventListener("app-metrics", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const metricsData = data.metrics || data;
        setMetrics(metricsData);

        const now = new Date();
        const timeStr = now.toLocaleTimeString("vi-VN", { hour12: false });

        setChartData((prev) => {
          const newData = [
            ...prev,
            { time: timeStr, cpu: metricsData.cpuUsage || 0, memory: metricsData.memoryUsage || 0 },
          ];
          return newData.slice(-maxDataPoints);
        });

        // Network throughput calculation
        if (typeof metricsData.networkRxBytes === "number" && typeof metricsData.networkTxBytes === "number") {
          const currentTotals = {
            rx: metricsData.networkRxBytes,
            tx: metricsData.networkTxBytes,
            timestamp: now.getTime(),
          };

          const previousTotals = lastNetworkTotalsRef.current;
          if (previousTotals) {
            const deltaTime = (currentTotals.timestamp - previousTotals.timestamp) / 1000;
            if (deltaTime > 0) {
              const rxRate = Math.max(0, (currentTotals.rx - previousTotals.rx) / 1024 / deltaTime);
              const txRate = Math.max(0, (currentTotals.tx - previousTotals.tx) / 1024 / deltaTime);

              setNetworkChartData((prev) => {
                const newData = [
                  ...prev,
                  { time: timeStr, rx: parseFloat(rxRate.toFixed(2)), tx: parseFloat(txRate.toFixed(2)) },
                ];
                return newData.slice(-maxDataPoints);
              });
            }
          }
          lastNetworkTotalsRef.current = currentTotals;
        }
      } catch (err) {
        console.error("Error parsing SSE metrics:", err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection lost. Reconnecting...");
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [appId]);

  const formatBytes = (bytes: number | null | undefined): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number | null | undefined): string => {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const latestNetworkRates = useMemo(() => {
    if (!networkChartData.length) return { rx: 0, tx: 0 };
    return networkChartData[networkChartData.length - 1];
  }, [networkChartData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Header */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
              <CardTitle className="text-charcoal">Runtime Metrics</CardTitle>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">Live</span>
              </div>
            )}
          </div>
          <CardDescription className="text-charcoal/60">
            Hiệu suất container thời gian thực
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Container Info */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 shadow-sage-glow"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-charcoal/50" />
              <span className="text-sm text-charcoal/70">
                {metrics.containerName || metrics.containerId || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-charcoal/50" />
              <span className="text-sm text-charcoal/70">
                Uptime: {formatUptime(metrics.uptime)}
              </span>
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                metrics.status?.toLowerCase().includes("running")
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {metrics.status || "Unknown"}
            </div>
          </div>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassMetricCard
          title="CPU Usage"
          value={metrics?.cpuUsage?.toFixed(1) || 0}
          unit="%"
          icon={Cpu}
          color="bg-blue-500"
          percentage={metrics?.cpuUsage || 0}
        />
        
        <MemoryGauge
          percentage={metrics?.memoryUsage || 0}
          used={formatBytes(metrics?.memoryUsageBytes)}
          total={formatBytes(metrics?.memoryLimit)}
        />
        
        <GlassMetricCard
          title="Network RX"
          value={latestNetworkRates.rx.toFixed(2)}
          unit="KB/s"
          icon={Network}
          color="bg-purple-500"
          subtitle={`Total: ${formatBytes(metrics?.networkRxBytes)}`}
        />
        
        <GlassMetricCard
          title="Network TX"
          value={latestNetworkRates.tx.toFixed(2)}
          unit="KB/s"
          icon={Network}
          color="bg-orange-500"
          subtitle={`Total: ${formatBytes(metrics?.networkTxBytes)}`}
        />
      </div>

      {/* CPU & Memory Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader>
            <CardTitle className="text-charcoal">CPU & Memory</CardTitle>
            <CardDescription className="text-charcoal/60">
              Sử dụng tài nguyên theo thời gian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 175, 173, 0.2)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    domain={[0, 100]}
                    label={{ value: "%", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#cpuGradient)"
                    name="CPU %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#memoryGradient)"
                    name="Memory %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Chart */}
      {networkChartData.length > 0 && (
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader>
            <CardTitle className="text-charcoal">Network Throughput</CardTitle>
            <CardDescription className="text-charcoal/60">
              KB/s nhận và gửi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkChartData}>
                  <defs>
                    <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(146, 175, 173, 0.2)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value.toFixed(2)} KB/s`}
                  />
                  <Area type="monotone" dataKey="rx" stroke="#8b5cf6" strokeWidth={2} fill="url(#rxGradient)" name="RX" />
                  <Area type="monotone" dataKey="tx" stroke="#f97316" strokeWidth={2} fill="url(#txGradient)" name="TX" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border-amber-200/50">
          <p className="text-sm text-amber-600">{error}</p>
        </div>
      )}
    </div>
  );
}

