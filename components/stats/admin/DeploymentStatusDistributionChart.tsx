"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeploymentStatusDistributionResponse } from "@/types/stats";

interface DeploymentStatusDistributionChartProps {
  statusDistribution: DeploymentStatusDistributionResponse | null;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#22c55e",
  FAILED: "#ef4444",
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
};

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  PENDING: "Đang chờ",
  IN_PROGRESS: "Đang xử lý",
};

export function DeploymentStatusDistributionChart({
  statusDistribution,
  isLoading,
}: DeploymentStatusDistributionChartProps) {
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

  if (!statusDistribution?.statusCounts || Object.keys(statusDistribution.statusCounts).length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">
            Phân Bố Trạng Thái Deployments
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Tỷ lệ các trạng thái deployment
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

  const chartData = Object.entries(statusDistribution.statusCounts)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      status: status,
    }))
    .filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50">
          Phân Bố Trạng Thái Deployments
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Tỷ lệ các trạng thái deployment (Tổng: {total.toLocaleString("vi-VN")})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => {
                const { name, percent } = props;
                return `${name}: ${((percent as number) * 100).toFixed(0)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [value.toLocaleString("vi-VN"), "Số lượng"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

