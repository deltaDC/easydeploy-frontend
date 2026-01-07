/**
 * Utility functions cho User Management
 */

import { UserStatus } from '@/types/user-management';

/**
 * Lấy badge variant theo status
 */
export const getStatusBadgeVariant = (status: UserStatus): string => {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'default'; // hoặc 'success' nếu có
    case UserStatus.BANNED:
      return 'destructive';
    case UserStatus.SUSPENDED:
      return 'warning'; // hoặc 'secondary'
    case UserStatus.DELETED:
      return 'outline';
    default:
      return 'default';
  }
};

/**
 * Lấy màu badge theo status
 */
export const getStatusColor = (status: UserStatus): string => {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case UserStatus.BANNED:
      return 'bg-red-100 text-red-800';
    case UserStatus.SUSPENDED:
      return 'bg-yellow-100 text-yellow-800';
    case UserStatus.DELETED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format date sang dạng human-readable
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'Chưa bao giờ';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  
  return formatDate(dateString);
};

/**
 * Get action button config
 */
export const getActionConfig = (status: UserStatus) => {
  return {
    canBan: status === UserStatus.ACTIVE || status === UserStatus.SUSPENDED,
    canSuspend: status === UserStatus.ACTIVE,
    canDelete: status === UserStatus.BANNED || status === UserStatus.SUSPENDED,
    canActivate: status === UserStatus.SUSPENDED || status === UserStatus.BANNED,
  };
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from email
 */
export const getInitials = (email: string): string => {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};
