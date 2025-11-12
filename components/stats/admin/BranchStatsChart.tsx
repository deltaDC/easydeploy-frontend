"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { BranchStatsResponse } from "@/types/stats";

interface BranchStatsChartProps {
  branchStats: BranchStatsResponse | null;
  isLoading?: boolean;
}

export function BranchStatsChart({
  branchStats,
  isLoading,
}: BranchStatsChartProps) {
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

  if (!branchStats?.branches || branchStats.branches.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">
            Thống Kê Deployments theo Branch
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Top branches được deploy nhiều nhất
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

  const chartData = branchStats.branches.map((branch) => ({
    branch: branch.branchName,
    deployments: branch.deploymentCount,
  }));

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50">
          Thống Kê Deployments theo Branch
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Top {branchStats.branches.length} branches được deploy nhiều nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="branch"
              stroke="#94a3b8"
              className="text-xs"
              tick={{ fill: "#64748b" }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value: number) => [value.toLocaleString("vi-VN"), "Deployments"]}
            />
            <Bar dataKey="deployments" fill="#0ea5e9" name="Số lượng Deployments" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

