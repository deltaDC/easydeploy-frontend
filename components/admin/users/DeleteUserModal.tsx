/**
 * Delete User Modal
 * Modal xác nhận delete user - xóa vĩnh viễn (cần check projects trước)
 */

'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
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

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSuccess,
}: DeleteUserModalProps) {
  const [reason, setReason] = useState('');
  const { deleteUser, isLoading } = useUserActions();

  const handleDelete = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }

    const success = await deleteUser(userId, reason);
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
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Xóa người dùng vĩnh viễn
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa vĩnh viễn người dùng <strong>{userEmail}</strong>. Hành động này không thể hoàn tác!
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Cảnh báo:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside mt-1">
                <li>Tất cả dữ liệu người dùng sẽ bị <strong>xóa vĩnh viễn</strong></li>
                <li>Tất cả dự án phải được dừng/xóa trước</li>
                <li>Tất cả logs và lịch sử hoạt động sẽ bị xóa</li>
                <li>Các liên kết tên miền sẽ bị hủy</li>
                <li>Hành động này <strong>KHÔNG THỂ</strong> hoàn tác</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Lưu ý:</strong> Nếu người dùng có dự án đang hoạt động, bạn phải cấm hoặc tạm ngưng họ trước khi xóa.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Lý do xóa <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Tại sao bạn xóa người dùng này? (ví dụ: yêu cầu GDPR, dọn dẹp tài khoản, tài khoản trùng lặp)"
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
            onClick={handleDelete}
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
