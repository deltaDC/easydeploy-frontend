"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import MonitoringDashboardOverview from "@/components/monitoring/MonitoringDashboardOverview";
import ContainersList from "@/components/monitoring/ContainersList";
import ContainerDetailDialog from "@/components/monitoring/ContainerDetailDialog";
import LogsViewer from "@/components/monitoring/LogsViewer";
import { monitoringService } from "@/services/monitoring.service";
import type { 
  MonitoringDashboard, 
  ContainerMetric, 
  ContainerDetail,
  SystemLog 
} from "@/types/monitoring.type";

export default function MonitoringPage() {
  const [dashboard, setDashboard] = useState<MonitoringDashboard | null>(null);
  const [containers, setContainers] = useState<ContainerMetric[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<ContainerDetail | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Initial load - fetch dashboard and containers in parallel
  useEffect(() => {
    loadInitialData();
    
    const interval = setInterval(() => {
      loadDashboardAndContainers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load system logs when logs tab is active
  useEffect(() => {
    if (activeTab === "logs" && systemLogs.length === 0) {
      loadSystemLogs();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      await loadDashboardAndContainers();
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadDashboardAndContainers = async () => {
    try {
      // Fetch both in parallel for faster loading
      const [dashboardData, containersData] = await Promise.all([
        monitoringService.getDashboard(),
        monitoringService.getAllContainers()
      ]);
      setDashboard(dashboardData);
      setContainers(containersData);
    } catch (error: any) {
      console.error("Failed to load monitoring data:", error);
      toast.error("Không thể tải dữ liệu monitoring");
    }
  };

  const loadSystemLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await monitoringService.getSystemLogs({ limit: 1000 });
      setSystemLogs(logs);
    } catch (error: any) {
      console.error("Failed to load system logs:", error);
      toast.error("Không thể tải system logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContainerDetail = async (containerId: string) => {
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
  };

  const handleRestartContainer = async (containerId: string, reason: string) => {
    setIsLoading(true);
    try {
      await monitoringService.restartContainer(containerId, { action: 'RESTART', reason });
      toast.success("Container đã được restart thành công");
      setIsDialogOpen(false);
      loadDashboardAndContainers();
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
      loadDashboardAndContainers();
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
      loadDashboardAndContainers();
    } catch (error: any) {
      console.error("Failed to start container:", error);
      toast.error("Không thể start container");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = () => {
    loadDashboardAndContainers();
    if (activeTab === "logs") {
      loadSystemLogs();
    }
    toast.success("Đã refresh dữ liệu");
  };

  if (isInitialLoading) {
    return (
      <div className="py-6">
        <div className="container-page space-y-6">
          <PageHeader
            title="System Monitoring"
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
      <div className="container-page space-y-6">
        <PageHeader
          title="System Monitoring"
          description="Giám sát log và tài nguyên hệ thống"
          actions={
            <Button onClick={handleRefreshAll} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="containers">Containers</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {dashboard && <MonitoringDashboardOverview dashboard={dashboard} />}
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
              onRefresh={loadSystemLogs}
              isLoading={isLoading}
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
