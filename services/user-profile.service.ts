/**
 * User Profile Service
 * API calls cho UC11 - Quản lý Thông tin Cá nhân
 */

import api from './api';
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateAvatarRequest,
  DeleteAccountRequest,
} from '@/types/user-profile';

const PROFILE_BASE = '/profile';

/**
 * Lấy thông tin profile người dùng hiện tại
 */
export const getCurrentProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(PROFILE_BASE);
  return response.data;
};

/**
 * Cập nhật thông tin profile
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await api.put<UserProfile>(PROFILE_BASE, data);
  return response.data;
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `${PROFILE_BASE}/change-password`,
    data
  );
  return response.data;
};

/**
 * Cập nhật avatar
 */
export const updateAvatar = async (
  avatarUrl: string
): Promise<UserProfile> => {
  const response = await api.patch<UserProfile>(
    `${PROFILE_BASE}/avatar`,
    { avatarUrl }
  );
  return response.data;
};

/**
 * Ngắt kết nối GitHub
 */
export const disconnectGithub = async (): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `${PROFILE_BASE}/disconnect-github`
  );
  return response.data;
};

/**
 * Xóa tài khoản
 */
export const deleteAccount = async (
  data: DeleteAccountRequest
): Promise<{ message: string; deleted: string }> => {
  const response = await api.post<{ message: string; deleted: string }>(
    `${PROFILE_BASE}/delete-account`,
    data
  );
  return response.data;
};

export const UserProfileService = {
  getCurrentProfile,
  updateProfile,
  changePassword,
  updateAvatar,
  disconnectGithub,
  deleteAccount,
};

export default UserProfileService;
