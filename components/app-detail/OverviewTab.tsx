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
  Terminal,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { ApplicationDetail } from "@/types/application.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import AppMonitoringService from "@/services/app-monitoring.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewTabProps {
  application: ApplicationDetail;
  containerStatus?: string;
  onActionComplete?: () => void;
}

// Environment Variable Item Component
function EnvVarItem({ envVar }: { envVar: any }) {
  const isPassword = envVar.key?.toLowerCase().includes('password') || 
                    envVar.key?.toLowerCase().includes('secret') ||
                    envVar.key?.toLowerCase().includes('key');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  return (
    <div className="env-grid-item group flex flex-col gap-2 h-full">
      <code className="text-xs font-semibold font-mono text-charcoal px-3 py-1.5 rounded-lg bg-white/20 flex-shrink-0">
        {envVar.key}
      </code>
      <div className="flex items-center gap-2 flex-1 min-h-[2.5rem]">
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          readOnly
          value={envVar.value || ""}
          className="flex-1 text-xs font-mono bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-charcoal/70 border-0 focus:outline-none h-full"
        />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {isPassword && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="h-6 w-6 p-0 password-toggle"
          >
            {showPassword ? (
              <EyeOff className="h-3 w-3 text-charcoal/50" />
            ) : (
              <Eye className="h-3 w-3 text-charcoal/50" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(`${envVar.key}=${envVar.value || ''}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="h-6 w-6 p-0"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-600" />
          ) : (
            <Copy className="h-3 w-3 text-charcoal/50" />
          )}
        </Button>
        </div>
      </div>
    </div>
  );
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
      className={`flex items-center gap-2 rounded-full bg-white/40 backdrop-blur-sm px-4 py-2 group ${copied ? 'pill-flash-mint' : ''}`}
    >
      <Icon className="h-4 w-4 text-misty-sage group-hover:text-emerald-600 transition-colors flex-shrink-0" strokeWidth={1.5} style={{
        filter: 'drop-shadow(0 0 4px rgba(146, 175, 173, 0.3))'
      }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-charcoal/70 mb-0.5">{label}</p>
        {linkable && value !== "Chưa có" ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline link-glow flex items-center gap-1 truncate"
          >
            {value}
            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))'
            }} />
          </a>
        ) : (
          <p className="text-sm font-medium text-slate-700 truncate font-mono">
            {value}
          </p>
        )}
      </div>
      {copyable && value !== "Chưa có" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity haptic-button rounded-full h-6 w-6 p-0 flex-shrink-0"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-600" />
          ) : (
            <Copy className="h-3 w-3 text-charcoal/50" />
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
      ? "bg-red-500/10 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
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
        <>
          {variant === "stop" && <AlertTriangle className="h-4 w-4 mr-2" strokeWidth={1.5} />}
          {variant !== "stop" && <Icon className="h-4 w-4 mr-2" strokeWidth={1.5} />}
        </>
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

  // Show skeleton if application data is incomplete
  if (!application || !application.id) {
    return (
      <div className="space-y-4">
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Control Deck - Combined Info and Controls */}
      <Card className="glass-card border-0 shadow-sage-glow sage-shadow-soft">
        <motion.div 
          className="grid gap-6 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Main Info Column */}
          <motion.div 
            className="lg:col-span-2 space-y-6 glass-divider pr-6 pl-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Application Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2 mb-4">
                <Container className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
                Thông tin ứng dụng
              </h3>
              <div className="space-y-4">
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
                {/* Uptime label - will be populated from containerStatus or metrics */}
                {isRunning && (
                  <div className="pill-info flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Heart className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-charcoal/50 mb-0.5">Uptime</p>
                      <p className="text-sm font-medium text-emerald-700">
                        Đang hoạt động
                      </p>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </motion.div>

            {/* Deploy Config Section */}
            {application.deployConfig && (
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2 mb-4">
                  <Settings2 className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
                  Cấu hình triển khai
                </h3>
                <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Build Command - Terminal Mini Style */}
                  <div className="code-snippet-glass relative p-4 rounded-lg" style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }}>
                    <div className="absolute top-2 left-2 terminal-icon-muted">
                      <Terminal className="h-3 w-3 text-charcoal/30" strokeWidth={1.5} />
                    </div>
                    <p className="text-xs text-charcoal/50 mb-2">Lệnh build</p>
                    {application.deployConfig.buildCommand ? (
                      <code className="text-sm font-mono text-emerald-900 truncate max-w-full block">
                        {application.deployConfig.buildCommand}
                      </code>
                    ) : (
                      <span className="text-sm text-charcoal/40">Chưa có</span>
                    )}
                  </div>
                  
                  {/* Start Command - Terminal Mini Style */}
                  <div className="code-snippet-glass relative p-4 rounded-lg" style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }}>
                    <div className="absolute top-2 left-2 terminal-icon-muted">
                      <Terminal className="h-3 w-3 text-charcoal/30" strokeWidth={1.5} />
                    </div>
                    <p className="text-xs text-charcoal/50 mb-2">Lệnh khởi động</p>
                    {application.deployConfig.startCommand ? (
                      <code className="text-sm font-mono text-emerald-900 truncate max-w-full block">
                        {application.deployConfig.startCommand}
                      </code>
                    ) : (
                      <span className="text-sm text-charcoal/40">Chưa có</span>
                    )}
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

                {/* Environment Variables - Grid Layout */}
                {application.deployConfig.environmentVars && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2 mb-4">
                      <Folder className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
                      Biến môi trường
                    </h3>
                    <div className="grid grid-cols-2 gap-4 items-stretch">
                      {(() => {
                        try {
                          const envVars = JSON.parse(application.deployConfig.environmentVars);
                          const envArray = Array.isArray(envVars)
                            ? envVars
                            : Object.entries(envVars).map(([key, value]) => ({ key, value }));

                          return envArray.length > 0 ? (
                            envArray.map((envVar: any, index: number) => (
                              <EnvVarItem key={index} envVar={envVar} />
                            ))
                          ) : (
                            <p className="text-sm text-charcoal/50 col-span-2">Không có biến môi trường</p>
                          );
                        } catch {
                          return <p className="text-sm text-rose-500 col-span-2">Lỗi khi đọc biến môi trường</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </motion.div>

          {/* Container Controls Column */}
          <motion.div 
            className="space-y-6 pl-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
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
            <div className="space-y-3 px-6 pb-6">
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
            </div>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

