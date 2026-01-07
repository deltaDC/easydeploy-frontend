/**
 * User Action Buttons Component
 * Buttons cho các actions: Ban, Suspend, Delete, Activate
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Pause, Trash2, CheckCircle } from 'lucide-react';
import { UserDetail } from '@/types/user-management';
import { Button } from '@/components/ui/button';
import { getActionConfig } from '@/utils/user-management.utils';
import BanUserModal from './BanUserModal';
import SuspendUserModal from './SuspendUserModal';
import DeleteUserModal from './DeleteUserModal';
import ActivateUserModal from './ActivateUserModal';

interface UserActionButtonsProps {
  user: UserDetail;
  onSuccess: () => void;
}

export default function UserActionButtons({ user, onSuccess }: UserActionButtonsProps) {
  const router = useRouter();
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  const actions = getActionConfig(user.status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Activate Button */}
        {actions.canActivate && (
          <Button
            onClick={() => setActivateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Kích hoạt
          </Button>
        )}

        {/* Suspend Button */}
        {actions.canSuspend && (
          <Button
            onClick={() => setSuspendModalOpen(true)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Pause className="w-4 h-4 mr-2" />
            Tạm khóa
          </Button>
        )}

        {/* Ban Button */}
        {actions.canBan && (
          <Button
            onClick={() => setBanModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Ban className="w-4 h-4 mr-2" />
            Cấm người dùng
          </Button>
        )}

        {/* Delete Button */}
        {actions.canDelete && (
          <Button
            onClick={() => setDeleteModalOpen(true)}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa vĩnh viễn
          </Button>
        )}
      </div>

      {/* Modals */}
      <BanUserModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSuccess={() => {
          onSuccess();
          router.push('/admin/users');
        }}
      />
      <SuspendUserModal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSuccess={onSuccess}
      />
      <DeleteUserModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSuccess={() => {
          onSuccess();
          router.push('/admin/users');
        }}
      />
      <ActivateUserModal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSuccess={onSuccess}
      />
    </div>
  );
}
