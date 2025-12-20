"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Activity, Terminal } from "lucide-react";
import ApplicationService from "@/services/application.service";
import BuildLogService from "@/services/build-log.service";
import AppMonitoringService from "@/services/app-monitoring.service";
import { ApplicationDetail } from "@/types/application.type";
import { BuildLogMessage } from "@/types/build-log.type";
import { translateStatus } from "@/lib/status-translations";
import { useDeploymentState } from "@/hooks/useDeploymentState";

// Import Misty Morning Components
import {
  MistyAppHeader,
  LockedTabBar,
  BuildLogsTab,
  OverviewTab,
  MetricsTab,
  RuntimeLogsTab,
  HistoryTab,
  isDeployingStatus,
  parseDeploymentStatus,
  DEFAULT_BUILD_STAGES,
} from "@/components/app-detail";

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  appName,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  appName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center rollback-overlay"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 max-w-md mx-4 shadow-misty-xl"
      >
        <h3 className="text-lg font-semibold text-charcoal mb-2">Xác nhận xóa ứng dụng</h3>
        <p className="text-charcoal/70 mb-6">
          Bạn có chắc chắn muốn xóa ứng dụng <span className="font-medium">&quot;{appName}&quot;</span>? 
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="glass-card-light haptic-button"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="haptic-button"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Deploying Placeholder for locked tabs
function DeployingPlaceholder({ type }: { type: "metrics" | "logs" }) {
  return (
    <Card className="glass-card border-0">
      <CardContent className="py-12">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center"
          >
            {type === "metrics" ? (
              <Activity className="h-6 w-6 text-amber-600" />
            ) : (
              <Terminal className="h-6 w-6 text-amber-600" />
            )}
          </motion.div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">
            Ứng dụng đang được triển khai
          </h3>
          <p className="text-sm text-charcoal/60 mb-4">
            {type === "metrics"
              ? "Dữ liệu hiệu suất sẽ khả dụng sau khi triển khai hoàn tất."
              : "Nhật ký runtime sẽ khả dụng sau khi container được khởi động."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams<{ appId: string }>();
  const router = useRouter();
  const appId = params?.appId || "";

  // Core state
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalLogs, setHistoricalLogs] = useState<BuildLogMessage[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [activeTab, setActiveTab] = useState("build-logs"); // Default to build-logs
  const [containerStatus, setContainerStatus] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Use deployment state hook
  const {
    status: deploymentStatus,
    isDeploying,
    isSuccess,
    isFailed,
    stages,
    logs: realtimeLogs,
    isConnected,
    tabsLocked,
    showSuccessAnimation,
    dismissSuccessAnimation,
  } = useDeploymentState({
    appId,
    initialStatus: application?.status || "idle",
    onBuildSuccess: () => {
      // Switch to overview tab on success
      setTimeout(() => setActiveTab("overview"), 500);
    },
    onBuildFailed: () => {
      // Keep on build-logs tab
    },
    onStatusDetected: async (detectedStatus) => {
      // When status is detected from logs, refetch application to sync with server
      if (detectedStatus === "success" || detectedStatus === "failed") {
        try {
          const response = await ApplicationService.getApplication(appId);
          setApplication(response);
          
          // Update container status if deployment completed
          if (detectedStatus === "success") {
            try {
              const metrics = await AppMonitoringService.getAppMetrics(appId);
              setContainerStatus(metrics.status);
            } catch (err) {
              console.error("Error fetching container status:", err);
            }
          }
        } catch (error) {
          console.error("Error refetching application after status detection:", error);
        }
      }
    },
  });

  // Combine historical and realtime logs
  const allLogs = useMemo(() => {
    const combined = [...historicalLogs, ...realtimeLogs];
    // Remove duplicates by timestamp + message
    const unique = combined.filter(
      (log, index, self) =>
        index === self.findIndex((l) => l.timestamp === log.timestamp && l.message === log.message)
    );
    // Sort by timestamp
    return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [historicalLogs, realtimeLogs]);

  // Fetch historical logs
  useEffect(() => {
    const fetchHistoricalLogs = async () => {
      if (!appId) return;

      try {
        setIsLoadingLogs(true);
        const response = await BuildLogService.getBuildLogsPaginated(appId, 0, 500);
        const convertedLogs: BuildLogMessage[] = response.content.map((log) => ({
          buildId: log.buildId,
          applicationId: appId,
          message: log.message || "",
          logLevel: log.logLevel || "INFO",
          timestamp: log.timestamp,
        }));
        setHistoricalLogs(convertedLogs);
      } catch (error) {
        console.error("Error fetching build logs:", error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchHistoricalLogs();
  }, [appId]);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      if (!appId) return;

      try {
        const response = await ApplicationService.getApplication(appId);
        setApplication(response);

        const isCurrentlyDeploying = isDeployingStatus(response.status);
        
        // Set default tab based on status
        if (isCurrentlyDeploying) {
          setActiveTab("build-logs");
        }

        // Fetch container status if not deploying
        if (!isCurrentlyDeploying) {
          try {
            const metrics = await AppMonitoringService.getAppMetrics(appId);
            setContainerStatus(metrics.status);
          } catch (err) {
            console.error("Error fetching container status:", err);
          }
        } else {
          setContainerStatus("deploying");
        }
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [appId]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    // If deploying and trying to switch to a locked tab, stay on build-logs
    if (isDeploying && tab !== "build-logs") {
      return;
    }
    setActiveTab(tab);
  };

  // Handle delete
  const handleDeleteApp = async () => {
    if (!appId) return;

    try {
      setIsDeleting(true);
      await ApplicationService.deleteApplication(appId);
      router.push("/apps");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Không thể xóa ứng dụng. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Refresh container status after actions
  const handleActionComplete = async () => {
    if (!appId) return;
    
    try {
      const app = await ApplicationService.getApplication(appId);
      setApplication(app);
      
      setTimeout(async () => {
        try {
          const metrics = await AppMonitoringService.getAppMetrics(appId);
          setContainerStatus(metrics.status);
        } catch (err) {
          console.error("Error refreshing container status:", err);
        }
      }, 2000);
    } catch (err) {
      console.error("Error refreshing application:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="glass-shimmer w-32 h-32 rounded-full mx-auto mb-4" />
          <p className="text-charcoal/60">Đang tải chi tiết ứng dụng...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-semibold text-charcoal mb-2">
          Không tìm thấy ứng dụng
        </h2>
        <p className="text-charcoal/60 mb-4">
          Ứng dụng bạn đang tìm kiếm không tồn tại.
        </p>
        <Button
          onClick={() => router.push("/apps")}
          className="glass-card-light haptic-button"
        >
          Quay lại danh sách ứng dụng
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <MistyAppHeader
        appName={application.name}
        status={parseDeploymentStatus(application.status)}
        publicUrl={application.publicUrl || undefined}
        isDeleting={isDeleting}
        onDeleteClick={() => setShowDeleteConfirm(true)}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          appName={application.name}
          isDeleting={isDeleting}
          onConfirm={handleDeleteApp}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </AnimatePresence>

      {/* Tab Bar with Lock functionality */}
      <div className="relative">
        <LockedTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabsLocked={tabsLocked}
          showSuccessAnimation={showSuccessAnimation}
          onSuccessAnimationComplete={dismissSuccessAnimation}
        />
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isDeploying ? (
                <DeployingPlaceholder type="metrics" />
              ) : (
                <OverviewTab
                  application={application}
                  containerStatus={containerStatus}
                  onActionComplete={handleActionComplete}
                />
              )}
            </motion.div>
          )}

          {/* Metrics Tab */}
          {activeTab === "metrics" && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isDeploying ? (
                <DeployingPlaceholder type="metrics" />
              ) : (
                <MetricsTab appId={appId} />
              )}
            </motion.div>
          )}

          {/* Runtime Logs Tab */}
          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isDeploying ? (
                <DeployingPlaceholder type="logs" />
              ) : (
                <RuntimeLogsTab appId={appId} />
              )}
            </motion.div>
          )}

          {/* Build Logs Tab */}
          {activeTab === "build-logs" && (
            <motion.div
              key="build-logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <BuildLogsTab
                logs={allLogs}
                stages={stages}
                isConnected={isConnected}
                isLoading={isLoadingLogs}
                status={application.status}
              />
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <HistoryTab
                appId={appId}
                onRollback={(deploymentId) => {
                  console.log("Rollback to:", deploymentId);
                  // Implement rollback logic here
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
