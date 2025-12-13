"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  History, 
  GitCommit, 
  GitBranch, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  Webhook,
  MousePointerClick,
  Timer
} from "lucide-react";
import DeploymentHistoryService from "@/services/deployment-history.service";
import { DeploymentHistory, TriggerType, DeploymentStatus } from "@/types/deployment-history.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { translateStatus } from "@/lib/status-translations";

interface DeploymentHistoryTabProps {
  appId: string;
}

export function DeploymentHistoryTab({ appId }: DeploymentHistoryTabProps) {
  const [history, setHistory] = useState<DeploymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
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
  };

  useEffect(() => {
    fetchHistory();
  }, [appId]);

  const getStatusColor = (status: DeploymentStatus): string => {
    const colors: Record<DeploymentStatus, string> = {
      'SUCCESS': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'FAILED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTriggerIcon = (trigger: TriggerType) => {
    switch (trigger) {
      case 'WEBHOOK':
        return <Webhook className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Timer className="h-4 w-4" />;
      default:
        return <MousePointerClick className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (trigger: TriggerType): string => {
    const labels: Record<TriggerType, string> = {
      'MANUAL': 'Thủ công',
      'WEBHOOK': 'Webhook',
      'SCHEDULED': 'Theo lịch',
    };
    return labels[trigger] || trigger;
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const truncateCommitMessage = (message: string | null, maxLength: number = 50): string => {
    if (!message) return '-';
    // Only take the first line
    const firstLine = message.split('\n')[0];
    if (firstLine.length <= maxLength) return firstLine;
    return firstLine.substring(0, maxLength) + '...';
  };

  const truncateSha = (sha: string | null): string => {
    if (!sha) return '-';
    return sha.substring(0, 7);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử triển khai
          </CardTitle>
          <CardDescription>Đang tải lịch sử...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử triển khai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Lịch sử triển khai
            </CardTitle>
            <CardDescription>
              {history.length > 0 
                ? `${history.length} lần triển khai` 
                : 'Chưa có lịch sử triển khai'}
            </CardDescription>
          </div>
          <Button onClick={fetchHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có lịch sử triển khai nào</p>
            <p className="text-sm mt-2">
              Các lần triển khai sẽ được hiển thị tại đây
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">
                    <div className="flex items-center gap-2">
                      <GitCommit className="h-4 w-4" />
                      Commit
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Branch
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Trigger</TableHead>
                  <TableHead className="w-[160px]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Thời gian
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Thời lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium" title={item.commitMessage || undefined}>
                          {truncateCommitMessage(item.commitMessage)}
                        </span>
                        <div className="flex items-center gap-2">
                          {item.commitUrl ? (
                            <a
                              href={item.commitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                            >
                              {truncateSha(item.commitSha)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground">
                              {truncateSha(item.commitSha)}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{item.branch || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {translateStatus(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {getTriggerIcon(item.triggerType)}
                        <span>{getTriggerLabel(item.triggerType)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.startedAt ? formatDateDDMMYYYYHHMMSS(item.startedAt) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

