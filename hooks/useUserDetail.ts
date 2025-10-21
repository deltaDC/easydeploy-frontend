/**
 * Custom hook để fetch chi tiết user với SWR
 */

import useSWR from 'swr';
import type { UserDetail } from '@/types/user-management';
import userManagementService from '@/services/user-management.service';

export const useUserDetail = (userId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<UserDetail>(
    userId ? ['user-detail', userId] : null,
    () => userManagementService.getUserById(userId!),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
};
