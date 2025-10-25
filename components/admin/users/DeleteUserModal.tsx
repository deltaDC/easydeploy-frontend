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
      alert('Please provide a reason');
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
            Delete User Permanently
          </DialogTitle>
          <DialogDescription>
            This will permanently delete user <strong>{userEmail}</strong>. This action is irreversible!
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Warning:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside mt-1">
                <li>All user data will be <strong>permanently deleted</strong></li>
                <li>All projects must be stopped/deleted first</li>
                <li>All logs and activity history will be removed</li>
                <li>Domain mappings will be unlinked</li>
                <li>This action <strong>CANNOT be undone</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> If user has active projects, you must ban or suspend them first before deletion.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason for Deletion <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Why are you deleting this user? (e.g., GDPR request, account cleanup, duplicate account)"
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
            onClick={handleDelete}
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
