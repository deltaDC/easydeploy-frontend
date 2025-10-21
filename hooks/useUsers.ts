/**
 * Custom hook để fetch danh sách users với SWR
 */

import useSWR from 'swr';
import type { UserListResponse, GetUsersParams } from '@/types/user-management';
import userManagementService from '@/services/user-management.service';

export const useUsers = (params: GetUsersParams = {}) => {
  const key = ['users', params];

  const { data, error, isLoading, mutate } = useSWR<UserListResponse>(
    key,
    () => userManagementService.getAllUsers(params),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    users: data?.users || [],
    totalUsers: data?.totalUsers || 0,
    currentPage: data?.currentPage || 1, // 1-based from backend
    totalPages: data?.totalPages || 0,
    pageSize: data?.pageSize || 20,
    isLoading,
    isError: error,
    mutate,
  };
};
