/**
 * User Table Row Actions
 * Dropdown menu với các actions: Ban, Suspend, Delete, Activate
 */

'use client';

import { useState } from 'react';
import { MoreVertical, Ban, Pause, Trash2, CheckCircle } from 'lucide-react';
import { User, UserStatus } from '@/types/user-management';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getActionConfig } from '@/utils/user-management.utils';
// @ts-ignore
import BanUserModal from './BanUserModal'; // @ts-ignore
import SuspendUserModal from './SuspendUserModal'; // @ts-ignore
import DeleteUserModal from './DeleteUserModal';// @ts-ignore
import ActivateUserModal from './ActivateUserModal';
interface UserTableRowActionsProps {
  user: User;
  onSuccess: () => void;
}

export default function UserTableRowActions({ user, onSuccess }: UserTableRowActionsProps) {
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  const actions = getActionConfig(user.status);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.canActivate && (
            <DropdownMenuItem onClick={() => setActivateModalOpen(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate
            </DropdownMenuItem>
          )}
          
          {actions.canSuspend && (
            <DropdownMenuItem onClick={() => setSuspendModalOpen(true)}>
              <Pause className="w-4 h-4 mr-2" />
              Suspend
            </DropdownMenuItem>
          )}

          {actions.canBan && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setBanModalOpen(true)}
                className="text-orange-600"
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </DropdownMenuItem>
            </>
          )}

          {actions.canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteModalOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <BanUserModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSuccess={onSuccess}
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
        onSuccess={onSuccess}
      />
      <ActivateUserModal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        userId={user.id}
        userEmail={user.email}
        onSuccess={onSuccess}
      />
    </>
  );
}
