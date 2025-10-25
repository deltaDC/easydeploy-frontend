'use client';

import { useDashboardOverview } from '@/hooks/useDashboard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentAppsCard } from '@/components/dashboard/RecentAppsCard';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { overview, isLoading, isError, mutate } = useDashboardOverview();

  const handleRefresh = () => {
    mutate();
  };

  if (isError) {
    return (
      <div className="py-6">
        <div className="container-page">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <p className="text-destructive font-medium">
                  Không thể tải dữ liệu dashboard
                </p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="container-page space-y-6">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Tổng quan về ứng dụng và triển khai của bạn"
          actions={
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button asChild size="sm">
                <Link href="/apps/new" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Deploy mới
                </Link>
              </Button>
            </div>
          }
        />

        {isLoading ? (
          <DashboardSkeleton />
        ) : overview ? (
          <>
            {/* Stats Cards */}
            <StatsCards stats={overview.stats} />

            {/* Recent Apps */}
            <RecentAppsCard 
              apps={overview.recentApplications} 
              onUpdate={handleRefresh} 
            />

            {/* Info about upcoming features */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    📊 Deployment logs và biểu đồ hoạt động sẽ được thêm trong phiên bản tiếp theo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dashboard tự động refresh mỗi 30 giây
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Apps Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
