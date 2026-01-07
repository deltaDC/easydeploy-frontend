/**
 * Ban User Modal
 * Modal xác nhận ban user - thu hồi token, dừng projects
 */

'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}

export default function BanUserModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSuccess,
}: BanUserModalProps) {
  const [reason, setReason] = useState('');
  const { banUser, isLoading } = useUserActions();

  const handleBan = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }

    const success = await banUser(userId, reason);
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
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Cấm người dùng
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ cấm vĩnh viễn người dùng <strong>{userEmail}</strong>. Hành động này sẽ:
          </DialogDescription>
        </DialogHeader>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-orange-800">Tác động:</p>
          <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
            <li>Đặt trạng thái người dùng thành <strong>BỊ CẤM</strong></li>
            <li>Thu hồi tất cả token xác thực</li>
            <li>Tạm dừng tất cả dự án đang hoạt động</li>
            <li>Vô hiệu hóa quyền truy cập API</li>
            <li>Người dùng không thể đăng nhập nữa</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Lý do <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Tại sao bạn cấm người dùng này? (ví dụ: spam, hoạt động độc hại, vi phạm điều khoản)"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleBan}
            disabled={isLoading || !reason.trim()}
            variant="warning"
          >
            {isLoading ? 'Đang cấm...' : 'Cấm người dùng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
