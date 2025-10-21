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
      alert('Please provide a reason');
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
            Suspend User
          </DialogTitle>
          <DialogDescription>
            This will temporarily suspend user <strong>{userEmail}</strong>. This action will:
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-yellow-800">Effects:</p>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Set user status to <strong>SUSPENDED</strong></li>
            <li>Temporarily disable login access</li>
            <li>Pause all active projects</li>
            <li>Can be reactivated by admin later</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Why are you suspending this user? (e.g., under investigation, temporary violation)"
            value={reason}
            onChange={(e: any) => setReason(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSuspend}
            disabled={isLoading || !reason.trim()}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Suspending...' : 'Suspend User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
