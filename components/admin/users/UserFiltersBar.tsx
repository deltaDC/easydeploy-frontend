/**
 * User Filters Bar Component
 * Filter by status, search, sort
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { UserStatus, SortDirection, type UserFilters } from '@/types/user-management';

interface UserFiltersBarProps {
  filters: UserFilters;
  totalUsers: number;
  onFilterChange: (filters: Partial<UserFilters>) => void;
  onRefresh: () => void;
}

export default function UserFiltersBar({
  filters,
  totalUsers,
  onFilterChange,
  onRefresh,
}: UserFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.keyword);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ keyword: searchValue });
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchValue, onFilterChange]);

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by email or username..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFilterChange({ status: value as UserFilters['status'] })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
            <SelectItem value={UserStatus.BANNED}>Banned</SelectItem>
            <SelectItem value={UserStatus.DELETED}>Deleted</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange({ sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="totalProjects">Projects</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction */}
        <Select
          value={filters.direction}
          onValueChange={(value) =>
            onFilterChange({ direction: value as SortDirection })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SortDirection.ASC}>Ascending</SelectItem>
            <SelectItem value={SortDirection.DESC}>Descending</SelectItem>
          </SelectContent>
        </Select>

        {/* Page Size */}
        <Select
          value={filters.size?.toString()}
          onValueChange={(value) => onFilterChange({ size: parseInt(value) })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button onClick={onRefresh} variant="outline" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Total count */}
      <div className="mt-4 text-sm text-gray-600">
        Total: <span className="font-semibold">{totalUsers}</span> users
        {filters.size && (
          <span className="ml-2">
            (Page {filters.page || 1} of {Math.ceil(totalUsers / filters.size)})
          </span>
        )}
      </div>
    </Card>
  );
}
