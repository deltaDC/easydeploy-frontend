"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Check, Loader2, X, AlertCircle, ChevronDown, ExternalLink, ArrowDown } from "lucide-react";
import { BuildStage, isDeployingStatus } from "./types";
import { BuildLogMessage } from "@/types/build-log.type";
import { Skeleton } from "@/components/ui/skeleton";

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
            {/* Stage Node - Smaller with glow effects */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative flex items-center justify-center
                w-10 h-10 rounded-full
                transition-all duration-300
                ${stage.status === "pending" ? "stage-pending" : ""}
                ${stage.status === "running" ? "pipeline-stage-running" : ""}
                ${stage.status === "success" ? "pipeline-stage-complete" : ""}
                ${stage.status === "failed" ? "stage-failed" : ""}
              `}
            >
              {stage.status === "pending" && (
                <div className="w-3 h-3 rounded-full bg-slate-400/50" />
              )}
              {stage.status === "running" && (
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
              )}
              {stage.status === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
              )}
              {stage.status === "failed" && (
                <X className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
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
                    h-0.5 rounded-full transition-all duration-500 relative
                    ${stage.status === "success"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                      : stage.status === "running"
                      ? "pipeline-line-shimmer bg-gradient-to-r from-amber-400 to-amber-300 opacity-60"
                      : "bg-slate-200 opacity-30"
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
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <span className="select-none opacity-70" style={{ 
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: '#E5E7EB',
        textShadow: '0 0 6px rgba(229, 231, 235, 0.3)'
      }}>
        [{new Date(log.timestamp).toLocaleTimeString("vi-VN", { hour12: false })}]
      </span>{" "}
      <span 
        className="font-semibold"
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          textShadow: log.logLevel?.toUpperCase() === 'ERROR' 
            ? '0 0 8px rgba(248, 113, 113, 0.6)'
            : log.logLevel?.toUpperCase() === 'WARN'
            ? '0 0 6px rgba(251, 191, 36, 0.5)'
            : log.logLevel?.toUpperCase() === 'SUCCESS'
            ? '0 0 8px rgba(74, 222, 128, 0.6)'
            : '0 0 6px rgba(74, 222, 128, 0.5)',
          color: log.logLevel?.toUpperCase() === 'ERROR' 
            ? '#f87171'
            : log.logLevel?.toUpperCase() === 'WARN'
            ? '#fbbf24'
            : log.logLevel?.toUpperCase() === 'SUCCESS'
            ? '#4ADE80'
            : '#4ADE80'
        }}
      >
        [{log.logLevel || "INFO"}]
      </span>{" "}
      <span style={{ 
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: '#E5E7EB',
        textShadow: '0 0 6px rgba(229, 231, 235, 0.3)'
      }}>{log.message || ""}</span>
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
  const [showScrollButton, setShowScrollButton] = useState(false);

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
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      setAutoScroll(true);
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
                  <span className="h-2 w-2 bg-emerald-500 rounded-full live-indicator" />
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

        <CardContent className="p-0 relative">
          {/* Terminal Window */}
          <div 
            className="mx-4 mb-4 rounded-lg overflow-hidden shadow-charcoal-inset relative terminal-inner-shadow terminal-scrollbar"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            {/* Corner mist effect - only at corners */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-br-full pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-tr-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-tl-full pointer-events-none" />
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>build-output</span>
              
              {/* Live Indicator */}
              {isConnected && (
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full live-indicator" />
                  <span className="text-xs text-emerald-400 font-mono live-indicator" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>Live</span>
                </div>
              )}
            </div>

            {/* Terminal Content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-80 overflow-y-auto p-4 terminal-scrollbar relative z-10"
            >
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Skeleton className="h-3 w-16 flex-shrink-0" />
                      <Skeleton className="h-3 w-20 flex-shrink-0" />
                      <Skeleton className="h-3 flex-1" />
                    </div>
                  ))}
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
              {showScrollButton && logs.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="scroll-to-bottom-btn glass-card p-2 rounded-full hover:bg-white/20 transition-colors"
                  title="Cuộn xuống dưới"
                >
                  <ArrowDown className="h-4 w-4 text-white" strokeWidth={2} />
                </motion.button>
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

