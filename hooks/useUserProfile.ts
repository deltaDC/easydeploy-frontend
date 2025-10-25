/**
 * User Profile Hook
 * Custom hook for UC11 - Quản lý Thông tin Cá nhân
 */

import useSWR from 'swr';
import { UserProfileService } from '@/services/user-profile.service';
import type { UserProfile } from '@/types/user-profile';

export function useUserProfile() {
  const {
    data: profile,
    error,
    isLoading,
    mutate,
  } = useSWR<UserProfile>('/profile', UserProfileService.getCurrentProfile, {
    revalidateOnFocus: false, // Không refetch khi focus window
    revalidateOnReconnect: false, // Không refetch khi reconnect
    shouldRetryOnError: false, // Không retry khi lỗi
    dedupingInterval: 60000, // Cache 60 giây, không gọi lại trong thời gian này
    revalidateIfStale: false, // Không refetch nếu data đã có (dù stale)
  });

  return {
    profile,
    isLoading,
    isError: error,
    mutate,
  };
}
