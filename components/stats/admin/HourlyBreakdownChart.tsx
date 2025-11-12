"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { HourlyStatDTO } from "@/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { formatNumber, formatPercentage } from "@/utils/stats.utils";

interface HourlyBreakdownChartProps {
  hourlyStats: HourlyStatDTO[];
  isLoading?: boolean;
}

export function HourlyBreakdownChart({
  hourlyStats,
  isLoading,
}: HourlyBreakdownChartProps) {
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

  if (!hourlyStats || hourlyStats.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Phân tích theo giờ</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Số lượng deployments theo giờ trong ngày
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            Chưa có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = hourlyStats.map((stat) => ({
    hour: `${stat.hour.toString().padStart(2, "0")}:00`,
    hourValue: stat.hour,
    deployments: stat.deploymentCount,
    successful: stat.successfulDeployments,
    successRate: stat.successRate,
  }));

  // Find peak hour
  const peakHour = chartData.reduce(
    (max, stat) => (stat.deployments > max.deployments ? stat : max),
    chartData[0]
  );

  const getBarColor = (hourValue: number, deployments: number) => {
    if (hourValue === peakHour.hourValue && peakHour.deployments > 0) {
      return "#0284c7";
    }
    const maxDeployments = Math.max(...chartData.map((d) => d.deployments));
    if (maxDeployments === 0) return "#0ea5e9";
    const intensity = deployments / maxDeployments;
    return `rgba(14, 165, 233, ${0.3 + intensity * 0.5})`;
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Clock className="h-5 w-5 text-sky-500" />
          Phân tích theo giờ
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Số lượng deployments theo giờ trong ngày (0-23h)
          {peakHour && peakHour.deployments > 0 && (
            <span className="block mt-1 text-xs">
              Peak: {peakHour.hour} ({formatNumber(peakHour.deployments)} deployments)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="hour"
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
              formatter={(value: number, name: string, props: any) => {
                if (name === "deployments") {
                  const entry = chartData.find((d) => d.hourValue === props.payload.hourValue);
                  if (entry) {
                    return [
                      `${formatNumber(value)} deployments\nSuccess Rate: ${formatPercentage(entry.successRate)}`,
                      "Deployments"
                    ];
                  }
                  return [formatNumber(value), "Deployments"];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Giờ ${label}`}
            />
            <Bar dataKey="deployments" name="Deployments" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.hourValue, entry.deployments)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

