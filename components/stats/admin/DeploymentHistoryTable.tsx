"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, X } from "lucide-react";
import type { DeploymentHistory, DeploymentFilters } from "@/types/stats";
import { formatDuration, formatDate, getStatusBadgeClasses, getStatusLabel, getEffectiveDate } from "@/utils/stats.utils";
import { EmptyState } from "@/components/stats/EmptyState";

interface DeploymentHistoryTableProps {
  deployments: DeploymentHistory[];
  isLoading?: boolean;
  onFilterChange?: (filters: DeploymentFilters) => void;
  filters?: DeploymentFilters;
  timeRange?: string;
}

export function DeploymentHistoryTable({
  deployments,
  isLoading,
  onFilterChange,
  filters = {},
  timeRange,
}: DeploymentHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(filters.status || "all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        status: value === "all" ? undefined : (value as any),
        timeRange: timeRange as any,
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        status: undefined,
        timeRange: timeRange as any,
      });
    }
  };

  // Filter deployments
  const filteredDeployments = deployments.filter((deployment) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        deployment.commitSha?.toLowerCase().includes(searchLower) ||
        deployment.branch?.toLowerCase().includes(searchLower) ||
        deployment.appId.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (statusFilter !== "all" && deployment.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDeployments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDeployments = filteredDeployments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-50">
              Lịch sử Deployments
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {filteredDeployments.length} deployments
            </CardDescription>
          </div>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-600 dark:text-slate-400"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input
              placeholder="Tìm kiếm theo commit, branch, app ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-slate-200 dark:border-slate-700"
              aria-label="Tìm kiếm deployments"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700" aria-label="Lọc theo trạng thái">
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="SUCCESS">Thành công</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
              <SelectItem value="PENDING">Đang chờ</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : paginatedDeployments.length === 0 ? (
          <EmptyState 
            type="deployments" 
            message={searchTerm || statusFilter !== "all" ? "Không tìm thấy deployments phù hợp" : undefined}
          />
        ) : (
          <>
            <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
                    <TableHead className="text-slate-700 dark:text-slate-300">App ID</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Trạng thái</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Branch</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Commit</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Thời gian</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Thời điểm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDeployments.map((deployment) => (
                    <TableRow
                      key={deployment.id}
                      className="hover:bg-sky-50 dark:hover:bg-sky-900/10 border-slate-200 dark:border-slate-700"
                    >
                      <TableCell className="font-mono text-xs">
                        {deployment.appId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeClasses(deployment.status)}
                        >
                          {getStatusLabel(deployment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {deployment.branch || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {deployment.commitSha?.substring(0, 7) || "N/A"}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDuration(deployment.durationSeconds)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(getEffectiveDate(deployment))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredDeployments.length > 0 && (
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredDeployments.length)} trong tổng số {filteredDeployments.length} kết quả
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Số lượng mỗi trang:</span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
