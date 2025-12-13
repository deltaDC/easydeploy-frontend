"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import MonitoringDashboardOverview from "@/components/monitoring/MonitoringDashboardOverview";
import ContainersList from "@/components/monitoring/ContainersList";
import ContainerDetailDialog from "@/components/monitoring/ContainerDetailDialog";
import LogsViewer from "@/components/monitoring/LogsViewer";
import { MetricChart } from "@/components/monitoring/MetricChart";
import { JvmMetricsCard } from "@/components/monitoring/JvmMetricsCard";
import { HttpMetricsCard } from "@/components/monitoring/HttpMetricsCard";
import { SystemMetricsCard } from "@/components/monitoring/SystemMetricsCard";
import { monitoringService } from "@/services/monitoring.service";
import { useMetricsStream } from "@/hooks/useMetricsStream";
import type { 
  MonitoringDashboard, 
  ContainerMetric, 
  ContainerDetail,
  SystemLog,
  PrometheusMetrics
} from "@/types/monitoring.type";

export default function MonitoringPage() {
  const [selectedContainer, setSelectedContainer] = useState<ContainerDetail | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [prometheusMetrics, setPrometheusMetrics] = useState<PrometheusMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Use SSE for real-time metrics
  const {
    dashboard,
    containers,
    isConnected,
    lastUpdate,
  } = useMetricsStream({
    enabled: true,
    onError: (error) => {
      console.error("Metrics stream error:", error);
      toast.error("Mất kết nối real-time, đang thử kết nối lại...");
    },
    onConnect: () => {
      console.log("✅ Connected to metrics stream");
      setIsInitialLoading(false);
    },
    onDisconnect: () => {
      console.log("🔌 Disconnected from metrics stream");
    },
  });

  // Load Prometheus metrics once on mount
  useEffect(() => {
    loadPrometheusMetrics();
  }, []);

  // Load system logs when logs tab is active
  useEffect(() => {
    if (activeTab === "logs" && systemLogs.length === 0) {
      loadSystemLogs();
    }
  }, [activeTab, systemLogs.length]);

  const loadPrometheusMetrics = async () => {
    try {
      const prometheusData = await monitoringService.getPrometheusMetrics();
      setPrometheusMetrics(prometheusData);
    } catch (error: any) {
      console.error("Failed to load Prometheus metrics:", error);
    }
  };

  const loadSystemLogs = async () => {
    try {
      console.time('⏱️ Load system logs');
      const logs = await monitoringService.getSystemLogs({ limit: 1000 });
      console.timeEnd('⏱️ Load system logs');
      setSystemLogs(logs);
    } catch (error: any) {
      console.error("Failed to load system logs:", error);
      toast.error("Không thể tải system logs");
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Reload Prometheus metrics (SSE handles container metrics automatically)
      await loadPrometheusMetrics();
      toast.success("Đã làm mới dữ liệu");
    } catch (error: any) {
      console.error("Failed to refresh:", error);
      toast.error("Không thể làm mới dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize callback to prevent ContainersList re-render
  const handleViewContainerDetail = useCallback(async (containerId: string) => {
    setIsLoading(true);
    try {
      const detail = await monitoringService.getContainerDetail(containerId);
      setSelectedContainer(detail);
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error("Failed to load container detail:", error);
      toast.error("Không thể tải chi tiết container");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRestartContainer = async (containerId: string, reason: string) => {
    setIsLoading(true);
    try {
      await monitoringService.restartContainer(containerId, { action: 'RESTART', reason });
      toast.success("Container đã được restart thành công");
      setIsDialogOpen(false);
      // SSE will automatically update metrics
    } catch (error: any) {
      console.error("Failed to restart container:", error);
      toast.error("Không thể restart container");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopContainer = async (containerId: string, reason: string) => {
    setIsLoading(true);
    try {
      await monitoringService.stopContainer(containerId, { action: 'STOP', reason });
      toast.success("Container đã được stop thành công");
      setIsDialogOpen(false);
      // SSE will automatically update metrics
    } catch (error: any) {
      console.error("Failed to stop container:", error);
      toast.error("Không thể stop container");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartContainer = async (containerId: string, reason: string) => {
    setIsLoading(true);
    try {
      await monitoringService.startContainer(containerId, { action: 'START', reason });
      toast.success("Container đã được start thành công");
      setIsDialogOpen(false);
      // SSE will automatically update metrics
    } catch (error: any) {
      console.error("Failed to start container:", error);
      toast.error("Không thể start container");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsLoading(true);
    try {
      // Refresh dữ liệu theo tab hiện tại
      switch (activeTab) {
        case "logs":
          await loadSystemLogs();
          toast.success("Đã refresh system logs");
          break;
        case "containers":
        case "overview":
        default:
          // Metrics are already real-time via SSE, just refresh Prometheus
          await loadPrometheusMetrics();
          toast.success("Đã refresh dữ liệu");
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="py-6">
        <div className="container mx-auto px-4 space-y-6 max-w-[1600px]">
          <PageHeader
            title="Giám sát hệ thống"
            description="Giám sát log và tài nguyên hệ thống"
          />
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Đang tải dữ liệu monitoring...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="container mx-auto px-4 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Giám sát hệ thống"
          description="Giám sát log và tài nguyên hệ thống"
          actions={
            <div className="flex items-center gap-3">
              {/* Real-time connection status */}
              <Badge variant={isConnected ? "default" : "destructive"} className="gap-1.5">
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Thời gian thực
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Đã ngắt kết nối
                  </>
                )}
              </Badge>
              
              {lastUpdate && isConnected && (
                <span className="text-xs text-muted-foreground">
                  Cập nhật lần cuối: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              
              <Button onClick={handleRefreshAll} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="containers">Container</TabsTrigger>
            <TabsTrigger value="logs">Nhật ký hệ thống</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {dashboard && <MonitoringDashboardOverview dashboard={dashboard} />}
            
            {/* Prometheus Metrics Section */}
            {prometheusMetrics && (
              <>
                {/* Time Series Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricChart
                    title="Sử dụng CPU tiến trình"
                    data={prometheusMetrics.cpuHistory}
                    unit="%"
                    color="#3b82f6"
                  />
                  <MetricChart
                    title="Bộ nhớ JVM Heap"
                    data={prometheusMetrics.memoryHistory}
                    unit="%"
                    color="#10b981"
                  />
                  <MetricChart
                    title="Tỷ lệ yêu cầu"
                    data={prometheusMetrics.requestRateHistory}
                    unit=" yêu cầu/s"
                    color="#8b5cf6"
                  />
                </div>

                {/* Detailed Metrics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <JvmMetricsCard metrics={prometheusMetrics.jvmMetrics} />
                  <HttpMetricsCard metrics={prometheusMetrics.httpMetrics} />
                  <SystemMetricsCard metrics={prometheusMetrics.systemMetrics} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="containers" className="space-y-4">
            <ContainersList
              containers={containers}
              onViewDetail={handleViewContainerDetail}
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <LogsViewer
              logs={systemLogs}
              title="System Logs"
            />
          </TabsContent>
        </Tabs>

        <ContainerDetailDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          container={selectedContainer}
          onRestart={handleRestartContainer}
          onStop={handleStopContainer}
          onStart={handleStartContainer}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
