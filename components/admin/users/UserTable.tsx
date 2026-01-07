/**
 * User Table Component
 * Hiển thị danh sách users với pagination
 */

'use client';

import Link from 'next/link';
import { User } from '@/types/user-management';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, MoreVertical } from 'lucide-react';
import { getStatusColor, formatDate, getInitials } from '@/utils/user-management.utils';
// @ts-ignore
import UserTableRowActions from './UserTableRowActions';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalUsers?: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function UserTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  pageSize,
  totalUsers,
  onPageChange,
  onRefresh,
}: UserTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Đang tải danh sách người dùng...</div>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Không tìm thấy người dùng nào</div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Table with scroll */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>GitHub</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Dự án</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
            <TableRow key={user.id}>
              {/* User Info */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.id}</div>
                  </div>
                </div>
              </TableCell>

              {/* GitHub */}
              <TableCell>
                {user.githubUsername ? (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    @{user.githubUsername}
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>

              {/* Roles */}
              <TableCell>
                <div className="flex gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              {/* Projects */}
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{user.totalProjects || 0}</div>
                  <div className="text-gray-500 text-xs">
                    {user.activeProjects || 0} hoạt động
                  </div>
                </div>
              </TableCell>

              {/* Created At */}
              <TableCell className="text-sm text-gray-600">
                {formatDate(user.createdAt)}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/users/${user.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <UserTableRowActions user={user} onSuccess={onRefresh} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            {/* Page info */}
            <div className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, totalUsers || users.length)} trong tổng số {totalUsers || users.length} kết quả
            </div>

            {/* Pagination controls */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    size="default"
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* Show max 7 page numbers */}
                {(() => {
                  const maxVisible = 7;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  const pages = [];
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  return pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={page === currentPage}
                        size="default"
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ));
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    size="default"
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </Card>
  );
}
