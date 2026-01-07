/**
 * Application Detail Modal
 * Modal hiển thị thông tin chi tiết dự án (chỉ thông tin cơ bản, không bao gồm secrets)
 */

'use client';

import { useState, useEffect } from 'react';
import { Package, ExternalLink, Calendar, Code, GitBranch, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/user-management.utils';
import userManagementService from '@/services/user-management.service';
import type { ApplicationDetailDTO } from '@/types/user-management';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  applicationId: string | null;
}

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  userId,
  applicationId,
}: ApplicationDetailModalProps) {
  const [application, setApplication] = useState<ApplicationDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId || !userId) {
      setApplication(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchApplication = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await userManagementService.getApplicationForAdmin(userId, applicationId);
        if (!cancelled) {
          setApplication(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Không thể tải thông tin dự án');
          console.error('Failed to load application:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchApplication();

    return () => {
      cancelled = true;
    };
  }, [isOpen, applicationId, userId]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'IN_PROGRESS':
      case 'DEPLOYING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      SUCCESS: 'Thành công',
      FAILED: 'Thất bại',
      IN_PROGRESS: 'Đang xử lý',
      DEPLOYING: 'Đang triển khai',
      PENDING: 'Chờ xử lý',
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {application ? application.name : 'Chi tiết dự án'}
          </DialogTitle>
          <DialogDescription>
            Thông tin cơ bản về dự án (không bao gồm secrets và cấu hình nhạy cảm)
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-8 text-center">
            <p className="text-gray-500">Đang tải thông tin...</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Đóng
            </Button>
          </div>
        )}

        {!isLoading && !error && application && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trạng thái:</span>
              <Badge variant={getStatusBadgeVariant(application.status)}>
                {getStatusLabel(application.status)}
              </Badge>
            </div>

            {/* Repository */}
            {application.repositoryFullName && (
              <div className="flex items-start gap-2">
                <Code className="w-4 h-4 mt-0.5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Repository:</span>
                  <p className="text-sm text-gray-600">{application.repositoryFullName}</p>
                </div>
              </div>
            )}

            {/* Branch */}
            {application.selectedBranch && (
              <div className="flex items-start gap-2">
                <GitBranch className="w-4 h-4 mt-0.5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Branch:</span>
                  <p className="text-sm text-gray-600">{application.selectedBranch}</p>
                </div>
              </div>
            )}

            {/* Language */}
            {application.language && (
              <div className="flex items-start gap-2">
                <Code className="w-4 h-4 mt-0.5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Ngôn ngữ:</span>
                  <p className="text-sm text-gray-600">{application.language}</p>
                </div>
              </div>
            )}

            {/* Public URL */}
            {application.publicUrl && (
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium">URL công khai:</span>
                  <a
                    href={application.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {application.publicUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Container ID */}
            {application.containerId && (
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 mt-0.5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Container ID:</span>
                  <p className="text-sm text-gray-600 font-mono">{application.containerId}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium">Ngày tạo:</span>
                  <p className="text-sm text-gray-600">{formatDate(application.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium">Cập nhật lần cuối:</span>
                  <p className="text-sm text-gray-600">{formatDate(application.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

