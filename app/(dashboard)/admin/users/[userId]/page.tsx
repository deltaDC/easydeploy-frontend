/**
 * Admin - User Detail Page
 * Hiển thị thông tin chi tiết user, stats, projects, và actions
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Github, Calendar, Activity, Package, Clock } from 'lucide-react';
import { useUserDetail } from '@/hooks/useUserDetail';
import { useUserActions } from '@/hooks/useUserActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusColor, formatDate, formatRelativeTime, getInitials } from '@/utils/user-management.utils';
import UserActionButtons from '@/components/admin/users/UserActionButtons';
import EditUserModal from '@/components/admin/users/EditUserModal';
import ApplicationDetailModal from '@/components/admin/users/ApplicationDetailModal';
import userManagementService from '@/services/user-management.service';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const { user, isLoading, isError, mutate } = useUserDetail(userId);
  const { updateUser } = useUserActions();
  const [applications, setApplications] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleEdit = async (roles: string[]) => {
    await updateUser(userId, roles);
    mutate();
  };

  useEffect(() => {
    if (userId) {
      // Fetch applications
      userManagementService.getUserApplications(userId)
        .then(setApplications)
        .catch(console.error)
        .finally(() => setLoadingApps(false));
      
      // Fetch login history
      userManagementService.getUserLoginHistory(userId, 20)
        .then(setLoginHistory)
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-center text-gray-500">Đang tải thông tin người dùng...</p>
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-center text-red-600">Không thể tải thông tin người dùng. Người dùng có thể không tồn tại.</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.back()}>Quay lại</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách người dùng
      </Button>

      {/* User Info Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="text-2xl">
              {getInitials(user.email)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.email}</h1>
                <p className="text-gray-500 text-sm mt-1">ID: {user.id}</p>
              </div>
              <Badge className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>

              {user.githubUsername && (
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    @{user.githubUsername}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Tham gia {formatDate(user.createdAt)}</span>
              </div>

              {user.lastLoginAt && (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Đăng nhập lần cuối {formatRelativeTime(user.lastLoginAt)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <EditUserModal user={user} onSuccess={() => mutate()} onEdit={handleEdit} />
              <UserActionButtons user={user} onSuccess={() => mutate()} />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Tổng dự án</div>
          <div className="text-2xl font-bold mt-1">{user.totalProjects || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Dự án đang chạy</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {user.activeProjects || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Số lần đăng nhập</div>
          <div className="text-2xl font-bold mt-1">{user.loginCount || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Địa chỉ IP đăng nhập cuối</div>
          <div className="text-lg font-mono mt-1">
            {user.lastLoginIp || 'Không có'}
          </div>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Danh sách dự án
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingApps ? (
            <p className="text-center text-gray-500 py-4">Đang tải...</p>
          ) : applications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Người dùng này chưa có dự án nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Cập nhật lần cuối</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <button
                        onClick={() => {
                          setSelectedApplicationId(app.id);
                          setIsApplicationModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {app.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          app.status === 'SUCCESS'
                            ? 'default'
                            : app.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(app.createdAt)}</TableCell>
                    <TableCell>{formatDate(app.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Nhật ký hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <p className="text-center text-gray-500 py-4">Đang tải...</p>
          ) : loginHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Chưa có lịch sử đăng nhập</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian đăng nhập</TableHead>
                  <TableHead>Địa chỉ IP</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((login) => (
                  <TableRow key={login.id}>
                    <TableCell>{formatDate(login.loginTime)}</TableCell>
                    <TableCell className="font-mono">{login.ipAddress || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-md truncate">
                      {login.userAgent || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplicationId(null);
        }}
        userId={userId}
        applicationId={selectedApplicationId}
      />
    </div>
  );
}