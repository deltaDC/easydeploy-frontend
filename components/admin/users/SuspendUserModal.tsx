/**
 * Suspend User Modal
 * Modal xác nhận suspend user - tạm khóa, có thể activate lại
 */

'use client';

import { useState } from 'react';
import { Pause } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUserActions } from '@/hooks/useUserActions';

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}

export default function SuspendUserModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSuccess,
}: SuspendUserModalProps) {
  const [reason, setReason] = useState('');
  const { suspendUser, isLoading } = useUserActions();

  const handleSuspend = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }

    const success = await suspendUser(userId, reason);
    if (success) {
      setReason('');
      onClose();
      onSuccess();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-600">
            <Pause className="w-5 h-5" />
            Tạm ngưng người dùng
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ tạm ngưng người dùng <strong>{userEmail}</strong>. Hành động này sẽ:
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-yellow-800">Tác động:</p>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Đặt trạng thái người dùng thành <strong>TẠM NGƯNG</strong></li>
            <li>Tạm thời vô hiệu hóa quyền đăng nhập</li>
            <li>Tạm dừng tất cả dự án đang hoạt động</li>
            <li>Có thể kích hoạt lại bởi admin sau này</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Lý do <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Tại sao bạn tạm ngưng người dùng này? (ví dụ: đang điều tra, vi phạm tạm thời)"
            value={reason}
            onChange={(e: any) => setReason(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleSuspend}
            disabled={isLoading || !reason.trim()}
            variant="warning"
          >
            {isLoading ? 'Đang tạm ngưng...' : 'Tạm ngưng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
