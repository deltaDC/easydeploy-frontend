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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from "@/components/ui/pagination";
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
  onViewCommit,
}: {
  deployment: DeploymentHistory;
  isFirst: boolean;
  isLast: boolean;
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

  const getAvatarUrl = () => {
    if (deployment.commitSha) {
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${deployment.commitSha}`;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative flex gap-4 slide-in-delayed"
    >
      {/* Vertical Timeline Line */}
      <div className="flex flex-col items-center">
        {/* Timeline Node */}
        <div className={`z-10 relative w-4 h-4 rounded-full ${
          deployment.status === "SUCCESS" ? "timeline-node-success" : "timeline-node-failed"
        } ${isFirst && deployment.status === "SUCCESS" ? "status-dot-ripple" : ""}`}>
          {deployment.status === "FAILED" && (
            <X className="absolute inset-0 m-auto h-2.5 w-2.5 text-white" strokeWidth={2.5} />
          )}
        </div>
        
        {/* Vertical Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 timeline-vertical-line mt-2" />
        )}
      </div>

      {/* Timeline Connector Line */}
      <div className="timeline-connector-line flex-shrink-0 mt-2" />

      {/* Content Card */}
      <div className="flex-1 pb-8">
        <div className={`glass-card-light p-4 hover:bg-white/50 transition-all duration-200 group magnify-on-click relative ${
          isFirst ? "history-card-current" : deployment.status === "FAILED" ? "history-card-failed" : "history-card-success"
        }`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              {/* Avatar + User Name */}
              <Avatar className="h-6 w-6 ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-white/60">
                <AvatarImage src={getAvatarUrl() || undefined} alt="Commit author" />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-charcoal font-medium">
                User đã deploy từ nhánh {deployment.branch || "main"}
              </span>
            </div>

            {/* Status Badge and Live Badge */}
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <Badge
                variant="secondary"
                className={`
                  ${deployment.status === "SUCCESS" ? "bg-emerald-100/20 text-emerald-700" : ""}
                  ${deployment.status === "FAILED" ? "bg-rose-100/20 text-rose-700" : ""}
                  ${deployment.status === "IN_PROGRESS" ? "bg-amber-100/50 text-amber-700" : ""}
                  ${deployment.status === "PENDING" ? "bg-slate-100/50 text-slate-700" : ""}
                `}
              >
                {translateStatus(deployment.status)}
              </Badge>
              {/* Live Badge for Current Version */}
              {isFirst && deployment.status === "SUCCESS" && (
                <Badge className="bg-emerald-500 text-white animate-pulse text-xs">
                  Live
                </Badge>
              )}
            </div>
          </div>

          {/* Body - Commit Message */}
          <div className="mb-3">
            <button
              onClick={onViewCommit}
              className="text-sm italic text-charcoal/80 hover:text-emerald-700 transition-colors text-left line-clamp-2"
            >
              {deployment.commitMessage || "Không có tin nhắn commit"}
            </button>
          </div>

          {/* Footer - Time & Duration */}
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
            <span className="font-mono text-charcoal/40">
              {deployment.commitSha?.substring(0, 7) || "N/A"}
            </span>
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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DeploymentHistoryService.getDeploymentHistory(appId);
      setHistory(data);
    } catch (err) {
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
      await fetchHistory();
    } catch (err) {
      // Ignore error
    } finally {
      setIsRollingBack(false);
    }
  };

  const totalPages = Math.ceil(history.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedHistory = history.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                {history.length > 0 && (
                  <span className="ml-2">
                    (Hiển thị {startIndex + 1}-{Math.min(endIndex, history.length)} / {history.length})
                  </span>
                )}
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
            <>
              <div className="relative">
                {paginatedHistory.map((deployment, index) => (
                  <motion.div
                    key={deployment.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <TimelineNode
                      deployment={deployment}
                      isFirst={index === 0 && currentPage === 0}
                      isLast={index === paginatedHistory.length - 1}
                      onViewCommit={() => setCommitPopup(deployment)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 0) {
                              handlePageChange(currentPage - 1);
                            }
                          }}
                          className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i;
                        } else if (currentPage <= 2) {
                          pageNumber = i;
                        } else if (currentPage >= totalPages - 3) {
                          pageNumber = totalPages - 5 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNumber);
                              }}
                              isActive={pageNumber === currentPage}
                              className="cursor-pointer"
                            >
                              {pageNumber + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages - 1) {
                              handlePageChange(currentPage + 1);
                            }
                          }}
                          className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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

