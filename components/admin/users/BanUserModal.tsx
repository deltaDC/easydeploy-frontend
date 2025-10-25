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
      alert('Please provide a reason');
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
            Ban User
          </DialogTitle>
          <DialogDescription>
            This will permanently ban user <strong>{userEmail}</strong>. This action will:
          </DialogDescription>
        </DialogHeader>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-orange-800">Effects:</p>
          <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
            <li>Set user status to <strong>BANNED</strong></li>
            <li>Revoke all authentication tokens</li>
            <li>Suspend all active projects</li>
            <li>Disable API access</li>
            <li>User cannot login anymore</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Why are you banning this user? (e.g., spam, malicious activity, ToS violation)"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleBan}
            disabled={isLoading || !reason.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Banning...' : 'Ban User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
