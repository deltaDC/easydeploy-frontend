"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Copy,
  Check,
  Play,
  Square,
  RotateCcw,
  Settings2,
  Loader2,
  Container,
  Globe,
  Calendar,
  Folder,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { ApplicationDetail } from "@/types/application.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import AppMonitoringService from "@/services/app-monitoring.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface OverviewTabProps {
  application: ApplicationDetail;
  containerStatus?: string;
  onActionComplete?: () => void;
}

// Glass Pill Component
function GlassPill({
  icon: Icon,
  label,
  value,
  copyable = false,
  linkable = false,
  onCopy,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  linkable?: boolean;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pill-info flex items-center gap-3 group"
    >
      <div className="p-2 rounded-lg bg-misty-sage/10">
        <Icon className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-charcoal/50 mb-0.5">{label}</p>
        {linkable && value !== "Chưa có" ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 link-glow flex items-center gap-1 truncate"
          >
            {value}
            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-sm font-medium text-charcoal truncate font-mono">
            {value}
          </p>
        )}
      </div>
      {copyable && value !== "Chưa có" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity haptic-button"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4 text-charcoal/50" />
          )}
        </Button>
      )}
    </motion.div>
  );
}

// Container Control Button
function ControlButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  loading,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "stop" | "outline";
}) {
  const baseClass = "w-full justify-start haptic-button transition-all duration-200";
  const variantClass =
    variant === "stop"
      ? "stop-button-reveal border-rose-200/50"
      : variant === "outline"
      ? "glass-card-light hover:bg-white/50"
      : "bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-200/50";

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Icon className="h-4 w-4 mr-2" strokeWidth={1.5} />
      )}
      {label}
    </Button>
  );
}

export function OverviewTab({
  application,
  containerStatus,
  onActionComplete,
}: OverviewTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const statusLower = containerStatus?.toLowerCase() || "";
  const isRunning = statusLower.includes("running") || statusLower.includes("up");
  const isStopped = statusLower.includes("exited") || statusLower.includes("stopped");
  const isDeploying = statusLower.includes("deploying") || statusLower.includes("in_progress");

  const handleAction = async (action: "start" | "stop" | "restart", actionName: string) => {
    if (!application.id) return;
    
    setIsLoading(true);
    setCurrentAction(action);

    try {
      let result: string;
      switch (action) {
        case "start":
          result = await AppMonitoringService.startApp(application.id);
          break;
        case "stop":
          result = await AppMonitoringService.stopApp(application.id);
          break;
        case "restart":
          result = await AppMonitoringService.restartApp(application.id);
          break;
      }

      toast({
        title: "Thành công",
        description: result || `${actionName} hoàn tất`,
      });

      onActionComplete?.();
      setTimeout(() => router.refresh(), 1000);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data || `Không thể ${actionName.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info Card */}
          <Card className="glass-card border-0 shadow-sage-glow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <Container className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
                Thông tin ứng dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassPill
                  icon={Container}
                  label="ID Container"
                  value={application.containerId || "Chưa có"}
                  copyable
                />
                <GlassPill
                  icon={Globe}
                  label="URL công khai"
                  value={application.publicUrl || "Chưa được triển khai"}
                  linkable={!!application.publicUrl}
                  copyable={!!application.publicUrl}
                />
                <GlassPill
                  icon={Calendar}
                  label="Ngày tạo"
                  value={formatDateDDMMYYYYHHMMSS(application.createdAt)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Deploy Config Card */}
          {application.deployConfig && (
            <Card className="glass-card border-0 shadow-sage-glow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
                  Cấu hình triển khai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Build Command */}
                  <div className="pill-info">
                    <p className="text-xs text-charcoal/50 mb-1">Lệnh build</p>
                    <code className="text-sm font-mono bg-charcoal/5 px-2 py-1 rounded block truncate">
                      {application.deployConfig.buildCommand || "Chưa có"}
                    </code>
                  </div>
                  
                  {/* Start Command */}
                  <div className="pill-info">
                    <p className="text-xs text-charcoal/50 mb-1">Lệnh khởi động</p>
                    <code className="text-sm font-mono bg-charcoal/5 px-2 py-1 rounded block truncate">
                      {application.deployConfig.startCommand || "Chưa có"}
                    </code>
                  </div>
                  
                  {/* Exposed Port */}
                  <GlassPill
                    icon={Globe}
                    label="Cổng công khai"
                    value={application.deployConfig.exposedPort?.toString() || "Chưa có"}
                  />
                  
                  {/* Auto Redeploy */}
                  <div className="pill-info flex items-center justify-between">
                    <div>
                      <p className="text-xs text-charcoal/50 mb-0.5">Tự động triển khai lại</p>
                      <p className="text-sm font-medium text-charcoal">
                        {application.deployConfig.autoRedeploy ? "Bật" : "Tắt"}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={application.deployConfig.autoRedeploy 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-slate-100 text-slate-600"
                      }
                    >
                      {application.deployConfig.autoRedeploy ? "Tự động" : "Thủ công"}
                    </Badge>
                  </div>
                  
                  {/* Publish Dir */}
                  {application.deployConfig.publishDir && (
                    <GlassPill
                      icon={Folder}
                      label="Thư mục publish"
                      value={application.deployConfig.publishDir}
                    />
                  )}
                  
                  {/* Root Dir */}
                  {application.deployConfig.rootDir && (
                    <GlassPill
                      icon={Folder}
                      label="Thư mục gốc"
                      value={application.deployConfig.rootDir}
                    />
                  )}
                  
                  {/* Health Check */}
                  {application.deployConfig.healthCheckPath && (
                    <GlassPill
                      icon={Heart}
                      label="Đường dẫn kiểm tra sức khỏe"
                      value={application.deployConfig.healthCheckPath}
                    />
                  )}
                </div>

                {/* Environment Variables */}
                {application.deployConfig.environmentVars && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-charcoal/50 mb-3">Biến môi trường</p>
                    <div className="space-y-2">
                      {(() => {
                        try {
                          const envVars = JSON.parse(application.deployConfig.environmentVars);
                          const envArray = Array.isArray(envVars)
                            ? envVars
                            : Object.entries(envVars).map(([key, value]) => ({ key, value }));

                          return envArray.length > 0 ? (
                            envArray.map((envVar: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-2 items-center pill-info py-2"
                              >
                                <code className="text-xs font-mono bg-charcoal/5 px-2 py-1 rounded text-emerald-700">
                                  {envVar.key}
                                </code>
                                <span className="text-charcoal/30">=</span>
                                <code className="text-xs font-mono bg-charcoal/5 px-2 py-1 rounded text-charcoal/70 truncate flex-1">
                                  {envVar.value || "•••••"}
                                </code>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-charcoal/50">Không có biến môi trường</p>
                          );
                        } catch {
                          return <p className="text-sm text-rose-500">Lỗi khi đọc biến môi trường</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Container Controls Column */}
        <div className="space-y-6">
          <Card className="glass-card border-0 shadow-sage-glow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
                Điều khiển Container
              </CardTitle>
              
              {/* Container Status */}
              {containerStatus && (
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isRunning
                        ? "bg-emerald-500 animate-pulse"
                        : isStopped
                        ? "bg-rose-500"
                        : isDeploying
                        ? "bg-amber-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isRunning
                        ? "text-emerald-600"
                        : isStopped
                        ? "text-rose-600"
                        : isDeploying
                        ? "text-amber-600"
                        : "text-slate-600"
                    }`}
                  >
                    {isRunning
                      ? "Container đang chạy"
                      : isStopped
                      ? "Container đã dừng"
                      : isDeploying
                      ? "Đang triển khai..."
                      : containerStatus}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <ControlButton
                icon={Play}
                label="Khởi động Container"
                onClick={() => handleAction("start", "Khởi động")}
                disabled={isRunning || isDeploying}
                loading={isLoading && currentAction === "start"}
                variant="default"
              />
              
              <ControlButton
                icon={Square}
                label="Dừng Container"
                onClick={() => handleAction("stop", "Dừng")}
                disabled={isStopped || isDeploying}
                loading={isLoading && currentAction === "stop"}
                variant="stop"
              />
              
              <ControlButton
                icon={RotateCcw}
                label="Khởi động lại Container"
                onClick={() => handleAction("restart", "Khởi động lại")}
                disabled={isStopped || isDeploying}
                loading={isLoading && currentAction === "restart"}
                variant="outline"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

