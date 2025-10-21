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
 * User trong danh sách (response từ GET /api/v1/admin/users)
 */
export interface User {
  id: string; // ezdpl000001
  email: string;
  githubUsername: string | null;
  githubId: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  roles: UserRole[];
  createdAt: string; // ISO string
  updatedAt: string;
  totalProjects?: number;
  activeProjects?: number;
}

/**
 * User detail đầy đủ (response từ GET /api/v1/admin/users/{userId})
 */
export interface UserDetail extends User {
  loginCount: number;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Query params cho GET /api/v1/admin/users
 */
export interface GetUsersParams {
  page?: number; // 1-based
  size?: number; // default 20
  sortBy?: string; // default 'createdAt'
  direction?: SortDirection; // default 'DESC'
  status?: UserStatus;
  keyword?: string; // search by email or username
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
  reason: string; // Lý do thực hiện hành động
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
  currentPage: number; // 1-based (từ backend)
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
