"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  GitCommit,
  GitBranch,
  Clock,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Webhook,
  MousePointerClick,
  Timer,
  Check,
  X,
  Loader2,
  User,
} from "lucide-react";
import DeploymentHistoryService from "@/services/deployment-history.service";
import { DeploymentHistory, TriggerType, DeploymentStatus } from "@/types/deployment-history.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { translateStatus } from "@/lib/status-translations";

interface HistoryTabProps {
  appId: string;
  onRollback?: (deploymentId: string) => void;
}

// Rollback Confirmation Modal
function RollbackConfirmModal({
  isOpen,
  deployment,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  deployment: DeploymentHistory | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen || !deployment) return null;

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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-100">
            <RotateCcw className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal">Xác nhận Rollback</h3>
        </div>

        <p className="text-charcoal/70 mb-4">
          Bạn có chắc muốn khôi phục về bản triển khai này?
        </p>

        <div className="pill-info mb-6">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="h-4 w-4 text-charcoal/50" />
            <span className="text-sm font-mono text-charcoal">
              {deployment.commitSha?.substring(0, 7) || "N/A"}
            </span>
          </div>
          <p className="text-sm text-charcoal/70 line-clamp-2">
            {deployment.commitMessage || "Không có tin nhắn commit"}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="glass-card-light haptic-button"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white haptic-button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Khôi phục
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Commit Info Popup
function CommitPopup({
  isOpen,
  deployment,
  onClose,
}: {
  isOpen: boolean;
  deployment: DeploymentHistory | null;
  onClose: () => void;
}) {
  if (!isOpen || !deployment) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card p-6 max-w-lg mx-4 shadow-misty-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal">Chi tiết Commit</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Commit SHA */}
            <div className="flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-charcoal/50" />
              {deployment.commitUrl ? (
                <a
                  href={deployment.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-emerald-600 hover:text-emerald-700 link-glow flex items-center gap-1"
                >
                  {deployment.commitSha}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="font-mono text-sm text-charcoal">
                  {deployment.commitSha || "N/A"}
                </span>
              )}
            </div>

            {/* Branch */}
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-charcoal/50" />
              <span className="text-sm text-charcoal">{deployment.branch || "N/A"}</span>
            </div>

            {/* Message */}
            <div className="pill-info">
              <p className="text-sm text-charcoal whitespace-pre-wrap">
                {deployment.commitMessage || "Không có tin nhắn commit"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Timeline Node Component
function TimelineNode({
  deployment,
  isFirst,
  isLast,
  onRollback,
  onViewCommit,
}: {
  deployment: DeploymentHistory;
  isFirst: boolean;
  isLast: boolean;
  onRollback: () => void;
  onViewCommit: () => void;
}) {
  const getStatusConfig = (status: DeploymentStatus) => {
    switch (status) {
      case "SUCCESS":
        return { icon: Check, color: "text-emerald-600", bg: "bg-emerald-500" };
      case "FAILED":
        return { icon: X, color: "text-rose-600", bg: "bg-rose-500" };
      case "IN_PROGRESS":
        return { icon: Loader2, color: "text-amber-600", bg: "bg-amber-500", spin: true };
      default:
        return { icon: Clock, color: "text-slate-500", bg: "bg-slate-400" };
    }
  };

  const statusConfig = getStatusConfig(deployment.status);
  const StatusIcon = statusConfig.icon;

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-4"
    >
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <div className="timeline-node z-10">
          <div className={`absolute inset-0 rounded-full ${statusConfig.bg} opacity-50`} />
        </div>
        
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-misty-sage/40 to-misty-sage/10 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="glass-card-light p-4 hover:bg-white/50 transition-all duration-200 group">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusIcon
                className={`h-4 w-4 ${statusConfig.color} ${statusConfig.spin ? "animate-spin" : ""}`}
              />
              <Badge
                variant="secondary"
                className={`
                  ${deployment.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : ""}
                  ${deployment.status === "FAILED" ? "bg-rose-100 text-rose-700" : ""}
                  ${deployment.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" : ""}
                  ${deployment.status === "PENDING" ? "bg-slate-100 text-slate-700" : ""}
                `}
              >
                {translateStatus(deployment.status)}
              </Badge>
              
              <div className="flex items-center gap-1 text-xs text-charcoal/50">
                {deployment.triggerType === "WEBHOOK" && <Webhook className="h-3 w-3" />}
                {deployment.triggerType === "SCHEDULED" && <Timer className="h-3 w-3" />}
                {deployment.triggerType === "MANUAL" && <MousePointerClick className="h-3 w-3" />}
                <span>
                  {deployment.triggerType === "MANUAL"
                    ? "Thủ công"
                    : deployment.triggerType === "WEBHOOK"
                    ? "Webhook"
                    : "Theo lịch"}
                </span>
              </div>
            </div>

            {/* Rollback Button */}
            {deployment.status === "SUCCESS" && !isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRollback}
                className="opacity-0 group-hover:opacity-100 transition-opacity haptic-button text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Khôi phục
              </Button>
            )}
          </div>

          {/* Commit Info */}
          <div className="mb-2">
            <button
              onClick={onViewCommit}
              className="text-sm text-charcoal font-medium hover:text-emerald-700 transition-colors text-left line-clamp-1"
            >
              {deployment.commitMessage || "Không có tin nhắn commit"}
            </button>
            <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/50">
              <span className="font-mono">
                {deployment.commitSha?.substring(0, 7) || "N/A"}
              </span>
              {deployment.branch && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {deployment.branch}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-charcoal/50">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {deployment.startedAt
                ? formatDateDDMMYYYYHHMMSS(deployment.startedAt)
                : "-"}
            </span>
            {deployment.durationSeconds && (
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {formatDuration(deployment.durationSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HistoryTab({ appId, onRollback }: HistoryTabProps) {
  const [history, setHistory] = useState<DeploymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<DeploymentHistory | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [commitPopup, setCommitPopup] = useState<DeploymentHistory | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DeploymentHistoryService.getDeploymentHistory(appId);
      setHistory(data);
    } catch (err) {
      console.error("Error fetching deployment history:", err);
      setError("Không thể tải lịch sử triển khai");
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRollbackConfirm = async () => {
    if (!rollbackTarget) return;

    setIsRollingBack(true);
    try {
      // Call rollback API here
      onRollback?.(rollbackTarget.id);
      setRollbackTarget(null);
      // Refresh history after rollback
      await fetchHistory();
    } catch (err) {
      console.error("Rollback failed:", err);
    } finally {
      setIsRollingBack(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-0 shadow-sage-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-charcoal">
            <History className="h-5 w-5 text-misty-sage" />
            Lịch sử triển khai
          </CardTitle>
          <CardDescription className="text-charcoal/60">Đang tải...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-0 shadow-sage-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-charcoal">
            <History className="h-5 w-5 text-misty-sage" />
            Lịch sử triển khai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-rose-600 mb-4">{error}</p>
            <Button onClick={fetchHistory} variant="outline" className="glass-card-light haptic-button">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="glass-card border-0 shadow-sage-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-charcoal">
                <History className="h-5 w-5 text-misty-sage" />
                Lịch sử triển khai
              </CardTitle>
              <CardDescription className="text-charcoal/60">
                {history.length > 0 ? `${history.length} lần triển khai` : "Chưa có lịch sử"}
              </CardDescription>
            </div>
            <Button
              onClick={fetchHistory}
              variant="outline"
              size="sm"
              className="glass-card-light haptic-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-charcoal/50">
              <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Chưa có lịch sử triển khai nào</p>
              <p className="text-sm mt-2">Các lần triển khai sẽ được hiển thị tại đây</p>
            </div>
          ) : (
            <div className="relative">
              {history.map((deployment, index) => (
                <TimelineNode
                  key={deployment.id}
                  deployment={deployment}
                  isFirst={index === 0}
                  isLast={index === history.length - 1}
                  onRollback={() => setRollbackTarget(deployment)}
                  onViewCommit={() => setCommitPopup(deployment)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rollback Confirmation */}
      <AnimatePresence>
        <RollbackConfirmModal
          isOpen={!!rollbackTarget}
          deployment={rollbackTarget}
          onConfirm={handleRollbackConfirm}
          onCancel={() => setRollbackTarget(null)}
          isLoading={isRollingBack}
        />
      </AnimatePresence>

      {/* Commit Popup */}
      <CommitPopup
        isOpen={!!commitPopup}
        deployment={commitPopup}
        onClose={() => setCommitPopup(null)}
      />
    </div>
  );
}

