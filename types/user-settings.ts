/**
 * User Settings Types
 * Types for user settings and preferences
 */

export interface UserSettings {
  // Thông báo
  emailNotifications: boolean;
  pushNotifications: boolean;
  deploymentUpdates: boolean;
  errorAlerts: boolean;

  // Quyền riêng tư
  publicProfile: boolean;
  showEmail: boolean;
  analyticsEnabled: boolean;

  // Bảo mật
  twoFactorEnabled: boolean;
  sessionTimeoutHours: number;
  loginAlerts: boolean;
}

export interface UpdateUserSettingsRequest {
  // Thông báo
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  deploymentUpdates?: boolean;
  errorAlerts?: boolean;

  // Quyền riêng tư
  publicProfile?: boolean;
  showEmail?: boolean;
  analyticsEnabled?: boolean;

  // Bảo mật
  twoFactorEnabled?: boolean;
  sessionTimeoutHours?: number;
  loginAlerts?: boolean;
}
