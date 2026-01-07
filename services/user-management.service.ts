/**
 * User Management Service
 * API calls cho Admin User Management
 */

import api from './api';
import type {
  User,
  UserDetail,
  UserListResponse,
  GetUsersParams,
  UpdateUserRequest,
  UserActionRequest,
  ActionResponse,
  ApplicationDetailDTO,
} from '@/types/user-management';

const USER_MANAGEMENT_BASE = '/admin/users';

/**
 * Lấy danh sách tất cả users với phân trang và filter
 */
export const getAllUsers = async (
  params: GetUsersParams = {}
): Promise<UserListResponse> => {
  const response = await api.get<UserListResponse>(USER_MANAGEMENT_BASE, {
    params: {
      page: params.page || 1,
      size: params.size || 20,
      sortBy: params.sortBy || 'createdAt',
      direction: params.direction || 'DESC',
      ...(params.status && { status: params.status }),
      ...(params.keyword && { keyword: params.keyword }),
    },
  });
  return response.data;
};

/**
 * Lấy chi tiết user theo ID
 */
export const getUserById = async (userId: string): Promise<UserDetail> => {
  const response = await api.get<UserDetail>(`${USER_MANAGEMENT_BASE}/${userId}`);
  return response.data;
};

/**
 * Cập nhật thông tin user
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<UserDetail> => {
  const response = await api.put<UserDetail>(
    `${USER_MANAGEMENT_BASE}/${userId}`,
    data
  );
  return response.data;
};

/**
 * Ban user (khóa tài khoản vĩnh viễn, thu hồi token, dừng project)
 */
export const banUser = async (
  userId: string,
  data: UserActionRequest
): Promise<ActionResponse> => {
  const response = await api.post<ActionResponse>(
    `${USER_MANAGEMENT_BASE}/${userId}/ban`,
    data
  );
  return response.data;
};

/**
 * Suspend user (tạm khóa, có thể activate lại)
 */
export const suspendUser = async (
  userId: string,
  data: UserActionRequest
): Promise<ActionResponse> => {
  const response = await api.post<ActionResponse>(
    `${USER_MANAGEMENT_BASE}/${userId}/suspend`,
    data
  );
  return response.data;
};

/**
 * Delete user (xóa vĩnh viễn - cần check project trước)
 */
export const deleteUser = async (
  userId: string,
  data: UserActionRequest
): Promise<ActionResponse> => {
  const response = await api.delete<ActionResponse>(
    `${USER_MANAGEMENT_BASE}/${userId}`,
    { data }
  );
  return response.data;
};

/**
 * Activate user (mở khóa tài khoản bị suspend)
 */
export const activateUser = async (
  userId: string,
  data: UserActionRequest
): Promise<ActionResponse> => {
  const response = await api.post<ActionResponse>(
    `${USER_MANAGEMENT_BASE}/${userId}/activate`,
    data
  );
  return response.data;
};

/**
 * Lấy danh sách applications của user
 */
export const getUserApplications = async (userId: string): Promise<any[]> => {
  const response = await api.get<any[]>(`${USER_MANAGEMENT_BASE}/${userId}/applications`);
  return response.data;
};

/**
 * Lấy lịch sử đăng nhập của user
 */
export const getUserLoginHistory = async (
  userId: string,
  limit: number = 20
): Promise<any[]> => {
  const response = await api.get<any[]>(`${USER_MANAGEMENT_BASE}/${userId}/login-history`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Lấy thông tin chi tiết dự án của user (chỉ thông tin cơ bản, không bao gồm secrets)
 */
export const getApplicationForAdmin = async (
  userId: string,
  applicationId: string
): Promise<ApplicationDetailDTO> => {
  const response = await api.get<ApplicationDetailDTO>(
    `${USER_MANAGEMENT_BASE}/${userId}/applications/${applicationId}`
  );
  return response.data;
};

// Export tất cả thành 1 object
const userManagementService = {
  getAllUsers,
  getUserById,
  updateUser,
  banUser,
  suspendUser,
  deleteUser,
  activateUser,
  getUserApplications,
  getUserLoginHistory,
  getApplicationForAdmin,
};

export default userManagementService;
