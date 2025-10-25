/**
 * Admin - User Detail Page
 * Hiển thị thông tin chi tiết user, stats, projects, và actions
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Github, Calendar, Activity } from 'lucide-react';
import { useUserDetail } from '@/hooks/useUserDetail';
import { useUserActions } from '@/hooks/useUserActions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getStatusColor, formatDate, formatRelativeTime, getInitials } from '@/utils/user-management.utils';
import UserActionButtons from '@/components/admin/users/UserActionButtons';
import EditUserModal from '@/components/admin/users/EditUserModal';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { user, isLoading, isError, mutate } = useUserDetail(userId);
  const { updateUser } = useUserActions();

  const handleEdit = async (roles: string[]) => {
    await updateUser(userId, roles);
    mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-center text-gray-500">Loading user details...</p>
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-center text-red-600">Failed to load user. User may not exist.</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.back()}>Go Back</Button>
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
        Back to Users
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
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>

              {user.lastLoginAt && (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Last login {formatRelativeTime(user.lastLoginAt)}</span>
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
          <div className="text-sm text-gray-600">Total Projects</div>
          <div className="text-2xl font-bold mt-1">{user.totalProjects || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active Projects</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {user.activeProjects || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Login Count</div>
          <div className="text-2xl font-bold mt-1">{user.loginCount || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Last Login IP</div>
          <div className="text-lg font-mono mt-1">
            {user.lastLoginIp || 'N/A'}
          </div>
        </Card>
      </div>

      {/* TODO: Add Projects List, Activity Log, etc. */}
    </div>
  );
}
