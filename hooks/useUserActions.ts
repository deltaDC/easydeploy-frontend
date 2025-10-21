/**
 * Custom hook cho các actions: ban, suspend, delete, activate user
 */

import { useState } from 'react';
import { toast } from 'sonner';
import type { UserActionRequest, UpdateUserRequest, UserRole } from '@/types/user-management';
import userManagementService from '@/services/user-management.service';

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId: string, roles: string[]) => {
    setIsLoading(true);
    try {
      const data: UpdateUserRequest = { roles: roles as UserRole[] };
      await userManagementService.updateUser(userId, data);
      toast.success('User updated successfully');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, reason: string) => {
    setIsLoading(true);
    try {
      const data: UserActionRequest = { reason };
      await userManagementService.banUser(userId, data);
      toast.success('User banned successfully');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to ban user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    setIsLoading(true);
    try {
      const data: UserActionRequest = { reason };
      await userManagementService.suspendUser(userId, data);
      toast.success('User suspended successfully');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to suspend user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string, reason: string) => {
    setIsLoading(true);
    try {
      const data: UserActionRequest = { reason };
      await userManagementService.deleteUser(userId, data);
      toast.success('User deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const activateUser = async (userId: string, reason: string) => {
    setIsLoading(true);
    try {
      const data: UserActionRequest = { reason };
      await userManagementService.activateUser(userId, data);
      toast.success('User activated successfully');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to activate user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    banUser,
    suspendUser,
    deleteUser,
    activateUser,
    updateUser,
    isLoading,
  };
};
