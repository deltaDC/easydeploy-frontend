"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Check, Loader2, X, AlertCircle, ChevronDown, ExternalLink } from "lucide-react";
import { BuildStage, isDeployingStatus } from "./types";
import { BuildLogMessage } from "@/types/build-log.type";

interface BuildLogsTabProps {
  logs: BuildLogMessage[];
  stages: BuildStage[];
  isConnected: boolean;
  isLoading: boolean;
  status: string;
  onViewErrorGuide?: () => void;
}

// Stage Progress Component
function StageProgress({ stages, currentStatus }: { stages: BuildStage[]; currentStatus: string }) {
  const isDeploying = isDeployingStatus(currentStatus);

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center flex-1">
            {/* Stage Node */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative flex items-center justify-center
                w-10 h-10 rounded-full
                transition-all duration-300
                ${stage.status === "pending" ? "stage-pending" : ""}
                ${stage.status === "running" ? "stage-running" : ""}
                ${stage.status === "success" ? "stage-success" : ""}
                ${stage.status === "failed" ? "stage-failed" : ""}
              `}
            >
              {stage.status === "pending" && (
                <div className="w-3 h-3 rounded-full bg-slate-400/50" />
              )}
              {stage.status === "running" && (
                <Loader2 className="w-5 h-5 text-amber-600 mist-spin" />
              )}
              {stage.status === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
              )}
              {stage.status === "failed" && (
                <X className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
              )}
            </motion.div>

            {/* Stage Label */}
            <div className="ml-2 flex-shrink-0">
              <p className={`
                text-xs font-medium
                ${stage.status === "pending" ? "text-slate-500" : ""}
                ${stage.status === "running" ? "text-amber-700" : ""}
                ${stage.status === "success" ? "text-emerald-700" : ""}
                ${stage.status === "failed" ? "text-rose-700" : ""}
              `}>
                {stage.displayName}
              </p>
            </div>

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="flex-1 mx-3">
                <div
                  className={`
                    h-0.5 rounded-full transition-all duration-500
                    ${stage.status === "success"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                      : "bg-slate-200"
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Log Line Component with highlight animation
function LogLine({
  log,
  index,
  isNew,
}: {
  log: BuildLogMessage;
  index: number;
  isNew: boolean;
}) {
  const getLogLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
        return "text-rose-400";
      case "WARN":
        return "text-amber-400";
      case "DEBUG":
        return "text-slate-500";
      default:
        return "text-emerald-300";
    }
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        mb-1 whitespace-pre-wrap break-words font-mono text-sm
        ${isNew ? "log-highlight" : ""}
      `}
    >
      <span className="text-slate-500 select-none">
        [{new Date(log.timestamp).toLocaleTimeString("vi-VN", { hour12: false })}]
      </span>{" "}
      <span className={`${getLogLevelColor(log.logLevel)} font-semibold`}>
        [{log.logLevel || "INFO"}]
      </span>{" "}
      <span className="text-slate-200">{log.message || ""}</span>
    </motion.div>
  );
}

export function BuildLogsTab({
  logs,
  stages,
  isConnected,
  isLoading,
  status,
  onViewErrorGuide,
}: BuildLogsTabProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [prevLogsCount, setPrevLogsCount] = useState(0);

  // Determine which logs are "new" based on the count difference
  const newLogsStartIndex = prevLogsCount;
  
  // Update the tracking state when logs change
  if (logs.length !== prevLogsCount) {
    setPrevLogsCount(logs.length);
  }

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const isFailed = status.toLowerCase() === "failed" || status.toLowerCase() === "error";
  const isDeploying = isDeployingStatus(status);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stage Progress */}
      <StageProgress stages={stages} currentStatus={status} />

      {/* Terminal Card */}
      <Card className="glass-card border-0 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-charcoal">
                <Terminal className="h-5 w-5" strokeWidth={1.5} />
                Nhật ký Build
              </CardTitle>
              <CardDescription className="text-charcoal/60">
                Nhật ký build thời gian thực từ Jenkins
              </CardDescription>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="flex items-center gap-2 text-sm text-emerald-600">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  Đang phát
                </span>
              )}
              {!isConnected && isDeploying && (
                <span className="flex items-center gap-2 text-sm text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang kết nối...
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Terminal Window */}
          <div className="charcoal-glass-dark mx-4 mb-4 rounded-lg overflow-hidden shadow-charcoal-inset">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono">build-output</span>
            </div>

            {/* Terminal Content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-80 overflow-y-auto p-4 scrollbar-thin"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="glass-shimmer w-full h-4 rounded mb-2" />
                    <div className="glass-shimmer w-3/4 h-4 rounded mb-2" />
                    <div className="glass-shimmer w-1/2 h-4 rounded" />
                    <p className="text-slate-500 text-sm mt-4">Đang tải nhật ký...</p>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-500">
                    <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Chưa có nhật ký build.</p>
                    <p className="text-sm mt-1">
                      Nhật ký sẽ xuất hiện ở đây khi build được kích hoạt.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {logs.map((log, index) => (
                    <LogLine
                      key={`${log.timestamp}-${index}`}
                      log={log}
                      index={index}
                      isNew={index >= newLogsStartIndex}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {!autoScroll && logs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-20 right-8"
                >
                  <Button
                    size="sm"
                    onClick={() => {
                      setAutoScroll(true);
                      scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                    className="bg-charcoal/80 hover:bg-charcoal text-white rounded-full shadow-lg haptic-button"
                  >
                    <ChevronDown className="h-4 w-4 mr-1 auto-scroll-indicator" />
                    Cuộn xuống
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error State */}
          <AnimatePresence>
            {isFailed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-4 mb-4 p-4 bg-rose-muted rounded-lg border border-rose-200/50"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-rose-800 mb-1">
                      Build thất bại
                    </h4>
                    <p className="text-sm text-rose-700/80 mb-3">
                      Có lỗi xảy ra trong quá trình build. Kiểm tra nhật ký ở trên để biết thêm chi tiết.
                    </p>
                    {onViewErrorGuide && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onViewErrorGuide}
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 haptic-button"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Xem hướng dẫn sửa lỗi
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

