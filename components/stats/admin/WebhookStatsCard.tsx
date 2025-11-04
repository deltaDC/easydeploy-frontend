"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import type { WebhookStatsResponse } from "@/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface WebhookStatsCardProps {
  stats: WebhookStatsResponse | null;
  isLoading?: boolean;
}

export function WebhookStatsCard({ stats, isLoading }: WebhookStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Webhook Statistics</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Không có dữ liệu
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const successPercentage = stats.totalEvents > 0 
    ? (stats.successfulEvents / stats.totalEvents) * 100 
    : 0;

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Webhook className="h-5 w-5 text-green-500" />
              Webhook Events
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Thống kê {stats.timeRange === "day" ? "hôm nay" : 
                       stats.timeRange === "month" ? "tháng này" : "năm nay"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Events */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Tổng số Events</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              {stats.totalEvents.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Webhook className="h-6 w-6 text-green-500" />
          </div>
        </div>

        {/* Success/Failed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Thành công
              </span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.successfulEvents.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Thất bại
              </span>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {stats.failedEvents.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tỷ lệ thành công
              </span>
            </div>
            <span className="text-lg font-bold text-sky-500">
              {stats.successRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={successPercentage} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

