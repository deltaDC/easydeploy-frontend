/**
 * User Settings Hook
 * Custom hook for user settings data
 */

import useSWR from 'swr';
import { UserSettingsService } from '@/services/user-settings.service';
import type { UserSettings } from '@/types/user-settings';

export function useUserSettings() {
  const {
    data: settings,
    error,
    isLoading,
    mutate,
  } = useSWR<UserSettings>('/profile/settings', UserSettingsService.getUserSettings, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    dedupingInterval: 60000,
    revalidateIfStale: false,
  });

  return {
    settings,
    isLoading,
    isError: error,
    mutate,
  };
}
