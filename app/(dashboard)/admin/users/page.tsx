/**
 * Admin - User Management Page
 * Danh sách tất cả users với filter, search, và pagination
 */

'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { UserStatus, SortDirection, type UserFilters } from '@/types/user-management';
import UserTable from '@/components/admin/users/UserTable';
import UserFiltersBar from '@/components/admin/users/UserFiltersBar';
import { Card } from '@/components/ui/card';

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    status: 'ALL',
    keyword: '',
    sortBy: 'createdAt',
    direction: SortDirection.DESC,
    page: 1,
    size: 20,
  });

  const { users, totalUsers, currentPage, totalPages, isLoading, isError, mutate } =
    useUsers({
      page: filters.page,
      size: filters.size,
      sortBy: filters.sortBy,
      direction: filters.direction,
      ...(filters.status !== 'ALL' && { status: filters.status as UserStatus }),
      ...(filters.keyword && { keyword: filters.keyword }),
    });

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-red-600">Failed to load users. Please try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Header - Fixed */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all users, roles, and permissions
        </p>
      </div>

      {/* Filters - Fixed */}
      <div className="mb-6">
        <UserFiltersBar
          filters={filters}
          totalUsers={totalUsers}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <UserTable
          users={users}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={filters.size}
          totalUsers={totalUsers}
          onPageChange={handlePageChange}
          onRefresh={mutate}
        />
      </div>
    </div>
  );
}
