'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Play, Square, RotateCw, Trash2, ExternalLink, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { RecentApplication, DeploymentStatus } from '@/types/dashboard';
import { DashboardService } from '@/services/dashboard.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RecentAppsCardProps {
  apps: RecentApplication[];
  onUpdate?: () => void;
}

export function RecentAppsCard({ apps, onUpdate }: RecentAppsCardProps) {
  const [actionAppId, setActionAppId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<RecentApplication | null>(null);

  const getStatusBadge = (app: RecentApplication) => {
    // Prioritize containerStatus over deployment status
    if (app.containerStatus) {
      const statusLower = app.containerStatus.toLowerCase();
      const isRunning = statusLower.includes('running') || statusLower.includes('up');
      const isStopped = statusLower.includes('exited') || statusLower.includes('stopped') || statusLower.includes('created');
      
      if (isRunning) {
        return (
          <Badge variant="default" className="gap-1.5 bg-emerald-100/50 text-emerald-700 border-emerald-200/30">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 status-running-glow animate-pulse" style={{ animationDuration: '2s' }} />
            Đang chạy
          </Badge>
        );
      } else if (isStopped) {
        return (
          <Badge variant="secondary" className="gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            Đã dừng
          </Badge>
        );
      }
    }
    
    // Fallback to deployment status
    const variants = {
      SUCCESS: { 
        variant: 'default' as const, 
        label: 'Thành công', 
        color: 'bg-green-500' 
      },
      PENDING: { 
        variant: 'secondary' as const, 
        label: 'Chờ xử lý', 
        color: 'bg-gray-500' 
      },
      FAILED: { 
        variant: 'destructive' as const, 
        label: 'Lỗi', 
        color: 'bg-red-500' 
      },
      IN_PROGRESS: { 
        variant: 'outline' as const, 
        label: 'Đang deploy', 
        color: 'bg-blue-500' 
      },
    };
    const config = variants[app.status];
    return (
      <Badge variant={config.variant} className="gap-1.5">
        <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const handleAction = async (
    action: 'stop' | 'restart' | 'delete',
    app: RecentApplication
  ) => {
    if (action === 'delete') {
      setAppToDelete(app);
      setDeleteDialogOpen(true);
      return;
    }

    setActionAppId(app.id);
    setIsActionLoading(true);

    try {
      if (action === 'stop') {
        await DashboardService.stopApp(app.id);
        toast.success(`Đã dừng app "${app.name}"`);
      } else if (action === 'restart') {
        await DashboardService.restartApp(app.id);
        toast.success(`Đã khởi động lại app "${app.name}"`);
      }
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Không thể ${action} app`);
    } finally {
      setIsActionLoading(false);
      setActionAppId(null);
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;

    setIsActionLoading(true);
    try {
      await DashboardService.deleteApp(appToDelete.id);
      toast.success(`Đã xóa app "${appToDelete.name}"`);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa app');
    } finally {
      setIsActionLoading(false);
      setDeleteDialogOpen(false);
      setAppToDelete(null);
    }
  };

  if (apps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ứng dụng gần đây</CardTitle>
          <CardDescription>5 ứng dụng được triển khai gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-3">
            <div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Chưa có ứng dụng nào được triển khai
            </p>
            <Button asChild size="sm">
              <Link href="/apps/new">
                Deploy app đầu tiên
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="frosted-glass-panel rounded-3xl colored-shadow-sage border-0">
        <CardHeader>
          <CardTitle className="text-charcoal">Ứng dụng gần đây</CardTitle>
          <CardDescription className="text-charcoal/60">5 ứng dụng được triển khai gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/10 hover:shadow-[0_0_20px_rgba(146,175,173,0.1)] transition-all duration-300"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/apps/${app.id}`}
                      className="font-medium hover:underline truncate"
                    >
                      {app.name}
                    </Link>
                    {app.publicUrl && (
                      <a
                        href={app.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-charcoal/50 hover:text-charcoal shrink-0 icon-glow-soft"
                        title={app.publicUrl}
                      >
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-charcoal/50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 icon-glow-soft" strokeWidth={1.5} />
                      {formatDistanceToNow(new Date(app.updatedAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(app)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isActionLoading && actionAppId === app.id}
                        className="icon-glow-soft"
                      >
                        <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {app.status === 'SUCCESS' && (
                        <DropdownMenuItem
                          onClick={() => handleAction('stop', app)}
                          className="gap-2"
                        >
                          <Square className="h-4 w-4" />
                          Dừng
                        </DropdownMenuItem>
                      )}
                      {app.status !== 'SUCCESS' && app.status !== 'IN_PROGRESS' && (
                        <DropdownMenuItem
                          onClick={() => handleAction('restart', app)}
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Khởi động
                        </DropdownMenuItem>
                      )}
                      {app.status !== 'IN_PROGRESS' && (
                        <DropdownMenuItem
                          onClick={() => handleAction('restart', app)}
                          className="gap-2"
                        >
                          <RotateCw className="h-4 w-4" />
                          Khởi động lại
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleAction('delete', app)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa app</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa app <strong>{appToDelete?.name}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isActionLoading ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
