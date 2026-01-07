/**
 * Types cho User Management Module
 * Mapping từ Backend DTOs sang Frontend Types
 */

// ============================================
// ENUMS
// ============================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

// ============================================
// USER TYPES
// ============================================

/**
 * User
 */
export interface User {
  id: string;
  email: string;
  githubUsername: string | null;
  githubId: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  totalProjects?: number;
  activeProjects?: number;
  lastLoginAt?: string | null;
}

/**
 * User detail
 */
export interface UserDetail extends User {
  loginCount: number;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
}

/**
 * Application detail for admin view (limited info, no secrets)
 */
export interface ApplicationDetailDTO {
  id: string;
  userId: string;
  name: string;
  status: string;
  publicUrl: string | null;
  containerId: string | null;
  createdAt: string;
  updatedAt: string;
  repositoryName: string | null;
  repositoryFullName: string | null;
  language: string | null;
  selectedBranch: string | null;
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Query params cho GET /api/v1/admin/users
 */
export interface GetUsersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: SortDirection;
  status?: UserStatus;
  keyword?: string;
}

/**
 * Request body cho PUT /api/v1/admin/users/{userId}
 */
export interface UpdateUserRequest {
  email?: string;
  githubUsername?: string;
  roles?: UserRole[];
}

/**
 * Request body cho POST /api/v1/admin/users/{userId}/ban
 * Cũng dùng cho suspend, delete, activate
 */
export interface UserActionRequest {
  reason: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Response từ GET /api/v1/admin/users
 */
export interface UserListResponse {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Response từ các action endpoints (ban, suspend, delete, activate)
 */
export interface ActionResponse {
  message: string;
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Filter state cho User Table
 */
export interface UserFilters {
  status: UserStatus | 'ALL';
  keyword: string;
  sortBy: string;
  direction: SortDirection;
  page: number;
  size: number;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  userId: string | null;
  userEmail: string | null;
}

/**
 * Action type cho modal
 */
export type UserActionType = 'ban' | 'suspend' | 'delete' | 'activate';

// ============================================
// STATISTICS TYPES
// ============================================

/**
 * Thống kê user
 */
export interface UserStatistics {
  totalProjects: number;
  activeProjects: number;
  loginCount: number;
  lastLoginAt: string | null;
}

// ============================================
// PROJECT TYPES (for user detail page)
// ============================================

/**
 * Project của user (minimal info)
 */
export interface UserProject {
  id: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEPLOYING' | 'FAILED';
  createdAt: string;
  deploymentUrl: string | null;
}
