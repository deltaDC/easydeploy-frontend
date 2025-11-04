"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebhookStatsResponse } from "@/types/stats";

interface WebhookEventsByTypeChartProps {
  webhookStats: WebhookStatsResponse | null;
  isLoading?: boolean;
}

export function WebhookEventsByTypeChart({
  webhookStats,
  isLoading,
}: WebhookEventsByTypeChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!webhookStats?.eventsByType || Object.keys(webhookStats.eventsByType).length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">
            Webhook Events theo Loại
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Phân tích webhook events theo event type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
            <p className="text-sm">Chưa có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(webhookStats.eventsByType)
    .map(([eventType, count]) => ({
      eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1),
      count: count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50">
          Webhook Events theo Loại
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Phân tích webhook events theo event type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="eventType"
              stroke="#94a3b8"
              className="text-xs"
              tick={{ fill: "#64748b" }}
            />
            <YAxis
              stroke="#94a3b8"
              className="text-xs"
              tick={{ fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#0ea5e9" name="Số lượng Events" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

