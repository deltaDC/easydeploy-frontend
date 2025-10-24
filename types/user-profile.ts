/**
 * User Profile Types
 * Types cho UC11 - Quản lý Thông tin Cá nhân
 */

export interface UserProfile {
  id: string;
  email: string;
  githubUsername: string | null;
  githubId: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'DELETED';
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isGithubLinked: boolean;
}

export interface UpdateProfileRequest {
  email?: string;
  avatarUrl?: string;
  githubUsername?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}
