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
      alert('Please provide a reason');
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
            Activate User
          </DialogTitle>
          <DialogDescription>
            This will activate user <strong>{userEmail}</strong> and restore access.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-green-800">Effects:</p>
          <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
            <li>Set user status to <strong>ACTIVE</strong></li>
            <li>Restore login access</li>
            <li>Allow user to manage projects again</li>
            <li>Enable API access</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Why are you activating this user? (e.g., appeal approved, issue resolved, account reviewed)"
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
            onClick={handleActivate}
            disabled={isLoading || !reason.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Activating...' : 'Activate User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
