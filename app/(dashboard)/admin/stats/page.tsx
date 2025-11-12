"use client";

import { useState, useEffect } from "react";
import { useSystemStats } from "@/hooks/useSystemStats";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useStatsTimeRange } from "@/hooks/useStatsTimeRange";
import { useTrendChart } from "@/hooks/useTrendChart";
import { SystemStatsCards } from "@/components/stats/admin/SystemStatsCards";
import { DeploymentTrendChart } from "@/components/stats/admin/DeploymentTrendChart";
import { StatsTimeRangeFilter } from "@/components/stats/admin/StatsTimeRangeFilter";
import { WebhookStatsCard } from "@/components/stats/admin/WebhookStatsCard";
import { DeploymentHistoryTable } from "@/components/stats/admin/DeploymentHistoryTable";
import { PeriodComparisonCard } from "@/components/stats/admin/PeriodComparisonCard";
import { TopPerformersTable } from "@/components/stats/admin/TopPerformersTable";
import { HourlyBreakdownChart } from "@/components/stats/admin/HourlyBreakdownChart";
import { WebhookEventsByTypeChart } from "@/components/stats/admin/WebhookEventsByTypeChart";
import { DeploymentStatusDistributionChart } from "@/components/stats/admin/DeploymentStatusDistributionChart";
import { BranchStatsChart } from "@/components/stats/admin/BranchStatsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StatsErrorBoundary } from "@/components/stats/StatsErrorBoundary";
import { ExportStatsModal } from "@/components/stats/admin/ExportStatsModal";

export default function AdminStatsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [deploymentFilters, setDeploymentFilters] = useState<{
    timeRange?: "day" | "month" | "year" | "custom";
    userId?: string;
    applicationId?: string;
    status?: "SUCCESS" | "FAILED" | "PENDING" | "IN_PROGRESS";
  }>({ timeRange: "month" });

  const {
    timeRange,
    customStartDate,
    customEndDate,
    setTimeRange,
    handleMonthChange,
    handleYearChange,
  } = useStatsTimeRange();

  const { 
    overview, 
    trend: hookTrend, 
    previousTrend: hookPreviousTrend,
    webhookStats,
    topApps,
    hourlyStats,
    deployments,
    statusDistribution,
    branchStats,
    isLoading, 
    error, 
    refresh, 
    fetchWebhookStats,
    fetchDeployments,
  } = useSystemStats({
    timeRange,
    startDate: customStartDate || undefined,
    endDate: customEndDate || undefined,
    autoRefresh: false,
  });


  const [chartType, setChartType] = useState<"deployments" | "users" | "webhooks">("deployments");
  const { trendChartData, isLoadingTrendChart } = useTrendChart({
    chartType,
    timeRange,
    startDate: customStartDate || undefined,
    endDate: customEndDate || undefined,
  });
  
  const {
    isExporting,
    isExportModalOpen,
    setIsExportModalOpen,
    handleExport,
  } = usePdfExport();

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/unauthorized");
    }
  }, [router, isAdmin]);

  if (!isAdmin()) {
    return null;
  }

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleTrendTypeChange = (type: "deployments" | "users" | "webhooks") => {
    setChartType(type);
  };

  return (
    <StatsErrorBoundary>
      <div className="space-y-6" role="main" aria-label="Trang thống kê hệ thống">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Thống Kê Hệ Thống
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Tổng quan và phân tích hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportClick}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Đã có lỗi xảy ra khi tải dữ liệu"}
          </AlertDescription>
        </Alert>
      )}

      {/* Time Range Filter */}
      <StatsTimeRangeFilter 
        value={timeRange} 
        onChange={(value) => {
          setTimeRange(value);
        }}
        onMonthChange={(monthNumber, year) => {
          handleMonthChange(monthNumber, year);
        }}
        onYearChange={(year) => {
          handleYearChange(year);
        }}
        startDate={customStartDate || undefined}
        endDate={customEndDate || undefined}
      />

      {/* Stats Cards */}
      <SystemStatsCards 
        summary={overview?.summary || null} 
        isLoading={isLoading} 
      />

      {/* Period Comparison */}
      {(() => {
        if (timeRange === "custom" || !hookTrend?.dataPoints || hookTrend.dataPoints.length === 0 || !hookPreviousTrend?.dataPoints || hookPreviousTrend.dataPoints.length === 0) {
          return null;
        }

        const getPeriodLabels = (tr: string) => {
          switch (tr) {
            case "week":
              return { current: "Tuần này", previous: "Tuần trước" };
            case "month":
              return { current: "Tháng này", previous: "Tháng trước" };
            case "year":
              return { current: "Năm này", previous: "Năm trước" };
            default:
              return { current: "Kỳ này", previous: "Kỳ trước" };
          }
        };

        const labels = getPeriodLabels(timeRange);
        const currentTotal = hookTrend.dataPoints.reduce((sum, point) => sum + (point.value || 0), 0);
        const previousTotal = hookPreviousTrend.dataPoints.reduce((sum, point) => sum + (point.value || 0), 0);

        return (
          <PeriodComparisonCard
            currentPeriodTotal={currentTotal}
            previousPeriodTotal={previousTotal}
            currentPeriodLabel={labels.current}
            previousPeriodLabel={labels.previous}
            metricLabel={
              chartType === "deployments" 
                ? "Tổng số Deployments" 
                : chartType === "users" 
                  ? "Tổng số Users" 
                  : "Tổng số Webhook Events"
            }
            isLoading={isLoading}
          />
        );
      })()}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deployment Trend */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Biểu đồ xu hướng
            </h2>
            <div className="flex gap-2">
              <Button
                variant={chartType === "deployments" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrendTypeChange("deployments")}
                className={chartType === "deployments" ? "bg-sky-500 hover:bg-sky-600" : ""}
              >
                Deployments
              </Button>
              <Button
                variant={chartType === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrendTypeChange("users")}
                className={chartType === "users" ? "bg-sky-500 hover:bg-sky-600" : ""}
              >
                Users
              </Button>
              <Button
                variant={chartType === "webhooks" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTrendTypeChange("webhooks")}
                className={chartType === "webhooks" ? "bg-sky-500 hover:bg-sky-600" : ""}
              >
                Webhooks
              </Button>
            </div>
          </div>
          <DeploymentTrendChart
            data={trendChartData?.dataPoints || []}
            previousData={undefined}
            timeRange={timeRange}
            type={chartType}
            isLoading={isLoadingTrendChart}
            startDate={customStartDate || undefined}
            endDate={customEndDate || undefined}
          />
        </div>

        {/* Webhook Stats Card */}
        <WebhookStatsCard stats={webhookStats} isLoading={isLoading} />
      </div>

      {/* Summary and Deployment History */}
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Summary Card */}
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-50">Chỉ số Deployments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.summary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Tỷ lệ thành công
                  </span>
                  <span className="text-lg font-semibold text-sky-500">
                    {overview.summary.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Thời gian deploy TB
                  </span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {Math.round(overview.summary.avgDeploymentDurationSeconds)}s
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cập nhật lần cuối: {overview.lastUpdated ? new Date(overview.lastUpdated).toLocaleString("vi-VN") : "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers and Hourly Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopPerformersTable 
          topApps={topApps?.topApps || []} 
          isLoading={isLoading} 
        />
        <HourlyBreakdownChart 
          hourlyStats={hourlyStats?.hourlyStats || []} 
          isLoading={isLoading} 
        />
      </div>

      {/* Detailed Analysis Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Phân Tích Chi Tiết
        </h2>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <DeploymentStatusDistributionChart 
            statusDistribution={statusDistribution}
            isLoading={isLoading}
          />
          <WebhookEventsByTypeChart 
            webhookStats={webhookStats}
            isLoading={isLoading}
          />
        </div>

        <BranchStatsChart 
          branchStats={branchStats}
          isLoading={isLoading}
        />
      </div>

      {/* Deployment History Table */}
      <DeploymentHistoryTable
        deployments={deployments}
        isLoading={isLoading}
        filters={deploymentFilters}
        timeRange={timeRange}
        onFilterChange={(filters) => {
          setDeploymentFilters(filters);
          fetchDeployments({ ...filters, timeRange: filters.timeRange || timeRange as any });
        }}
      />

      {/* Export Modal */}
      <ExportStatsModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </div>
    </StatsErrorBoundary>
  );
}

