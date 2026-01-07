'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
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
import { MoreVertical, Play, Square, RotateCw, Trash2, Clock, Activity } from 'lucide-react';
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
            <div className="relative h-2.5 w-2.5">
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <div className="absolute inset-0 rounded-full bg-emerald-500" />
            </div>
            Đang chạy
          </Badge>
        );
      } else if (isStopped) {
        return (
          <Badge variant="secondary" className="gap-1.5 bg-gray-100/50 text-gray-700 border-gray-200/30">
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
        color: 'bg-green-500',
        bg: 'bg-green-100/50',
        text: 'text-green-700',
        border: 'border-green-200/30'
      },
      PENDING: { 
        variant: 'secondary' as const, 
        label: 'Chờ xử lý', 
        color: 'bg-gray-500',
        bg: 'bg-gray-100/50',
        text: 'text-gray-700',
        border: 'border-gray-200/30'
      },
      FAILED: { 
        variant: 'destructive' as const, 
        label: 'Lỗi', 
        color: 'bg-red-500',
        bg: 'bg-red-100/50',
        text: 'text-red-700',
        border: 'border-red-200/30'
      },
      IN_PROGRESS: { 
        variant: 'outline' as const, 
        label: 'Đang deploy', 
        color: 'bg-blue-500',
        bg: 'bg-blue-100/50',
        text: 'text-blue-700',
        border: 'border-blue-200/30'
      },
    };
    const config = variants[app.status];
    return (
      <Badge variant={config.variant} className={`gap-1.5 ${config.bg} ${config.text} ${config.border}`}>
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
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Ứng dụng gần đây</CardTitle>
          <CardDescription>4 ứng dụng được triển khai gần nhất</CardDescription>
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
      <Card className="bg-white/40 backdrop-blur-[20px] border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.1)] h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-charcoal">Hoạt động gần đây</CardTitle>
            <CardDescription className="text-charcoal/60">4 ứng dụng được triển khai gần nhất</CardDescription>
          </div>
          <Link 
            href="/apps" 
            className="text-sm text-charcoal/60 hover:text-charcoal transition-colors"
          >
            Xem tất cả
          </Link>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            {apps.slice(0, 4).map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className="
                    flex items-center gap-4 p-4 rounded-2xl
                    bg-white/40 backdrop-blur-[20px] border border-white/60
                    hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)]
                    hover:-translate-y-1 hover:ring-2 hover:ring-emerald-100 hover:ring-opacity-50
                    transition-all duration-300
                  "
                >
                  {/* Avatar/Favicon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                  </div>

                  {/* App Info */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/apps/${app.id}`}
                        className="font-medium text-charcoal hover:text-emerald-600 transition-colors truncate"
                      >
                        {app.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-charcoal/50">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {formatDistanceToNow(new Date(app.updatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center shrink-0">
                    {getStatusBadge(app)}
                  </div>
                </div>
              </motion.div>
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
