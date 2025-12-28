"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Activity, Cpu, Zap, Network, Clock, Server, ArrowDown, ArrowUp, WifiOff, RefreshCw } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import type { AppMetrics } from "@/types/app-monitoring";
import { Skeleton } from "@/components/ui/skeleton";

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
  waveformData,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  color: string;
  percentage?: number;
  subtitle?: string;
  waveformData?: number[];
}) {
  const orbColor = color === "bg-blue-500" ? "blurred-orb-blue" : 
                   color === "bg-purple-500" ? "blurred-orb-purple" : 
                   color === "bg-orange-500" ? "blurred-orb-orange" : "blurred-orb-emerald";

  const waveformPath = waveformData && waveformData.length > 0
    ? waveformData
        .map((val, idx) => {
          const x = (idx / (waveformData.length - 1)) * 100;
          const y = 100 - (val / 100) * 100;
          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 shadow-sage-glow relative overflow-hidden gradient-mesh"
    >
      {/* Blurred orb background */}
      <div className={`absolute top-0 right-0 w-24 h-24 blurred-orb ${orbColor} opacity-20`} />
      
      <div className="relative z-10">
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
                className={`h-full rounded-full ${color} liquid-glow relative`}
                style={{
                  boxShadow: `0 0 10px ${color.replace("bg-", "rgba(").replace("blue-500", "59, 130, 246").replace("purple-500", "139, 92, 246").replace("orange-500", "249, 115, 22").replace("emerald", "16, 185, 129")}, 0.6)`
                }}
              />
            </div>
          </div>
        )}
        {subtitle && <p className="text-xs text-charcoal/50 mt-2">{subtitle}</p>}
        
        {/* Waveform chart */}
        {waveformPath && (
          <div className="mt-3 waveform-chart">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-8">
              <defs>
                <linearGradient id={`waveformGradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color.replace("bg-", "#")} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={color.replace("bg-", "#")} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${waveformPath} L 100 100 L 0 100 Z`}
                fill={`url(#waveformGradient-${title})`}
                className="area"
              />
              <path
                d={waveformPath}
                stroke={color.replace("bg-", "#")}
                strokeWidth="1.5"
                fill="none"
                className="path"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Memory Gauge Chart
function MemoryGauge({ percentage, used, total, waveformData }: { 
  percentage: number; 
  used: string; 
  total: string;
  waveformData?: number[];
}) {
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference * 0.75;

  // Generate waveform path if data provided
  const waveformPath = waveformData && waveformData.length > 0
    ? waveformData
        .map((val, idx) => {
          const x = (idx / (waveformData.length - 1)) * 100;
          const y = 100 - (val / 100) * 100;
          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 shadow-sage-glow relative overflow-hidden gradient-mesh"
    >
      {/* Blurred orb background */}
      <div className="absolute top-0 right-0 w-32 h-32 blurred-orb blurred-orb-emerald opacity-20" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Zap className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
          </div>
          <span className="text-xs text-charcoal/50">Memory Usage</span>
        </div>
        
        {/* Liquid Wave Visualization */}
        {waveformPath ? (
          <div className="relative w-full h-32 mx-auto mb-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="liquidWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#34D399" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d={`${waveformPath} L 100 100 L 0 100 Z`}
                fill="url(#liquidWaveGradient)"
                className="liquid-wave"
                filter="url(#glow)"
              />
              <path
                d={waveformPath}
                stroke="#10B981"
                strokeWidth="2"
                fill="none"
                filter="url(#glow)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-charcoal">{percentage.toFixed(1)}%</span>
              <span className="text-xs text-charcoal/50">Used</span>
            </div>
          </div>
        ) : (
          <div className="relative w-36 h-36 mx-auto liquid-fill-animation overflow-hidden">
            {/* Background arc */}
            <svg className="w-full h-full -rotate-135" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="rgba(146, 175, 173, 0.2)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * 0.75} ${circumference}`}
                strokeLinecap="round"
                style={{ vectorEffect: 'non-scaling-stroke' }}
              />
              {/* Progress arc with liquid fill effect */}
              {percentage > 0 && (
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
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
                    vectorEffect: 'non-scaling-stroke',
                  }}
                />
              )}
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
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm text-charcoal">
            <span className="font-medium">{used}</span>
            <span className="text-charcoal/50"> / {total}</span>
          </p>
        </div>
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
    const fetchInitialMetrics = async () => {
      try {
        const data = await AppMonitoringService.getAppMetrics(appId);
        setMetrics(data);
      } catch (err: any) {
      }
    };
    fetchInitialMetrics();

    // SSE connection
    if (eventSourceRef.current) return;

    const connectSSE = () => {
      try {
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
      }
    });

        eventSource.onerror = () => {
          setIsConnected(false);
          setError("Connection lost. Reconnecting...");
          
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          
          setTimeout(() => {
            if (!eventSourceRef.current) {
              connectSSE();
            }
          }, 3000);
        };
      } catch (err) {
        setError("Không thể kết nối đến luồng metrics");
        setIsConnected(false);
      }
    };

    connectSSE();

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

  // Show skeleton if no metrics and not connected
  if (!metrics && !isConnected && !error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card p-4 shadow-sage-glow">
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
        
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Metrics Grid - CPU & Memory on top row, Network & Disk on bottom */}
      {!error && (
      <div className="grid gap-6">
        {/* Top Row: CPU & Memory */}
        <div className="grid gap-6 md:grid-cols-2">
        <GlassMetricCard
          title="CPU Usage"
          value={metrics?.cpuUsage?.toFixed(1) || 0}
          unit="%"
          icon={Cpu}
          color="bg-blue-500"
          percentage={metrics?.cpuUsage || 0}
          waveformData={chartData.slice(-20).map(d => d.cpu)}
        />
        
        <MemoryGauge
          percentage={metrics?.memoryUsage || 0}
          used={formatBytes(metrics?.memoryUsageBytes)}
          total={formatBytes(metrics?.memoryLimit)}
          waveformData={chartData.slice(-20).map(d => d.memory)}
        />
        </div>
        
        {/* Bottom Row: Network */}
        <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 shadow-sage-glow relative overflow-hidden gradient-mesh"
        >
          <div className="absolute top-0 right-0 w-24 h-24 blurred-orb blurred-orb-purple opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ArrowDown className="h-6 w-6 text-purple-400 network-icon-neon" strokeWidth={1} style={{ color: '#8b5cf6' }} />
              </div>
              <span className="text-xs text-charcoal/50">Network RX</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-charcoal font-tabular-nums">{latestNetworkRates.rx.toFixed(2)}</span>
              <span className="text-sm text-charcoal/50">KB/s</span>
            </div>
            <p className="text-xs text-charcoal/50 mt-2">Total: {formatBytes(metrics?.networkRxBytes)}</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 shadow-sage-glow relative overflow-hidden gradient-mesh"
        >
          <div className="absolute top-0 right-0 w-24 h-24 blurred-orb blurred-orb-orange opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <ArrowUp className="h-6 w-6 text-orange-400 network-icon-neon" strokeWidth={1} style={{ color: '#f97316' }} />
              </div>
              <span className="text-xs text-charcoal/50">Network TX</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-charcoal font-tabular-nums">{latestNetworkRates.tx.toFixed(2)}</span>
              <span className="text-sm text-charcoal/50">KB/s</span>
            </div>
            <p className="text-xs text-charcoal/50 mt-2">Total: {formatBytes(metrics?.networkTxBytes)}</p>
          </div>
        </motion.div>
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
            <div className="h-[280px] overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} style={{ border: 'none', outline: 'none' }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(51, 65, 85, 0.5)",
                      borderRadius: "8px",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: "white",
                    }}
                    labelStyle={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: "white",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#cpuGradient)"
                    name="CPU %"
                    style={{ border: 'none', outline: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#memoryGradient)"
                    name="Memory %"
                    style={{ border: 'none', outline: 'none' }}
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
            <div className="h-[240px] overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkChartData} style={{ border: 'none', outline: 'none' }}>
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
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: "#E5E7EB",
                    }}
                    labelStyle={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: "#E5E7EB",
                    }}
                    formatter={(value: number) => `${value.toFixed(2)} KB/s`}
                  />
                  <Area type="basis" dataKey="rx" stroke="#8b5cf6" strokeWidth={2} fill="url(#rxGradient)" name="RX" />
                  <Area type="basis" dataKey="tx" stroke="#f97316" strokeWidth={2} fill="url(#txGradient)" name="TX" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
      )}

      {/* Connection Lost Overlay */}
      {error && (
        <div className="connection-overlay glass-card p-8 rounded-lg text-center">
          <WifiOff className="h-16 w-16 mx-auto mb-4 text-rose-400" strokeWidth={1.5} />
          <p className="text-lg font-semibold text-charcoal mb-2">Mất kết nối</p>
          <p className="text-sm text-charcoal/70 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử kết nối lại
          </Button>
        </div>
      )}
    </div>
  );
}

