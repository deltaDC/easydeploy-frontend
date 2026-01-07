/**
 * Activate User Modal
 * Modal xác nhận activate user - mở khóa tài khoản bị suspend/ban
 */

'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
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

interface ActivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}

export default function ActivateUserModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSuccess,
}: ActivateUserModalProps) {
  const [reason, setReason] = useState('');
  const { activateUser, isLoading } = useUserActions();

  const handleActivate = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }

    const success = await activateUser(userId, reason);
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
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Kích hoạt người dùng
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ kích hoạt người dùng <strong>{userEmail}</strong> và khôi phục quyền truy cập.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-green-800">Tác động:</p>
          <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
            <li>Đặt trạng thái người dùng thành <strong>HOẠT ĐỘNG</strong></li>
            <li>Khôi phục quyền đăng nhập</li>
            <li>Cho phép người dùng quản lý dự án trở lại</li>
            <li>Kích hoạt quyền truy cập API</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Lý do <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Tại sao bạn kích hoạt người dùng này? (ví dụ: khiếu nại được chấp nhận, vấn đề đã giải quyết, tài khoản đã xem xét)"
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
            onClick={handleActivate}
            disabled={isLoading || !reason.trim()}
            variant="success"
          >
            {isLoading ? 'Đang kích hoạt...' : 'Kích hoạt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
