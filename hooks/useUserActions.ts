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
      toast.success('Cập nhật người dùng thành công');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật người dùng');
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
      toast.success('Đã cấm người dùng thành công');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cấm người dùng');
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
      toast.success('Đã tạm ngưng người dùng thành công');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạm ngưng người dùng');
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
      toast.success('Đã xóa người dùng thành công');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xóa người dùng');
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
      toast.success('Đã kích hoạt người dùng thành công');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể kích hoạt người dùng');
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
