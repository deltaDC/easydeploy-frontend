/**
 * User Settings Service
 * API calls for user settings management
 */

import api from './api';
import type { UserSettings, UpdateUserSettingsRequest } from '@/types/user-settings';

const SETTINGS_BASE = '/profile/settings';

/**
 * Lấy cài đặt người dùng hiện tại
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await api.get<UserSettings>(SETTINGS_BASE);
  return response.data;
};

/**
 * Cập nhật cài đặt người dùng
 */
export const updateUserSettings = async (
  data: UpdateUserSettingsRequest
): Promise<UserSettings> => {
  const response = await api.put<UserSettings>(SETTINGS_BASE, data);
  return response.data;
};

export const UserSettingsService = {
  getUserSettings,
  updateUserSettings,
};

export default UserSettingsService;
