"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendDataPoint } from "@/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, getWeek } from "date-fns";

interface DeploymentTrendChartProps {
  data: TrendDataPoint[];
  previousData?: TrendDataPoint[]; 
  timeRange: string;
  type: "deployments" | "users" | "webhooks";
  isLoading?: boolean;
  startDate?: string;
  endDate?: string;
}

export function DeploymentTrendChart({
  data,
  previousData,
  timeRange,
  type,
  isLoading,
  startDate,
  endDate,
}: DeploymentTrendChartProps) {
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

  const targetDate = startDate ? new Date(startDate) : new Date();
  let chartData: { date: string; value: number }[] = [];
  let description = "";

  if (timeRange === "month") {
    const startOfTargetMonth = startOfMonth(targetDate);
    const endOfTargetMonth = endOfMonth(targetDate);
    const weeksInMonth = eachWeekOfInterval(
      { start: startOfTargetMonth, end: endOfTargetMonth },
      { weekStartsOn: 1 }
    );
    
    const weeklyData = new Map<string, number>();
    data.forEach((point) => {
      if (!point.timestamp) return;
      const pointDate = new Date(point.timestamp);
      const weekStart = startOfWeek(pointDate, { weekStartsOn: 1 });
      const weekKey = weekStart.toISOString().split('T')[0];
      const currentValue = weeklyData.get(weekKey) || 0;
      weeklyData.set(weekKey, currentValue + (point.value || 0));
    });

    chartData = weeksInMonth.map((weekStart) => {
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
      const value = weeklyData.get(weekKey) || 0;
      return {
        date: `Tuần ${weekNumber} (${format(weekStart, "dd/MM")})`,
        value: value,
      };
    });
    
    description = `Thống kê theo tháng ${format(targetDate, "MM/yyyy")} (${weeksInMonth.length} tuần)`;
  } else {
    const targetYear = targetDate.getFullYear();
    const startOfTargetYear = startOfYear(targetDate);
    const endOfTargetYear = endOfYear(targetDate);
    
    const monthlyData = new Map<string, number>();
    data.forEach((point) => {
      if (!point.timestamp) return;
      const pointDate = new Date(point.timestamp);
      const pointYear = pointDate.getFullYear();
      
      if (pointYear === targetYear) {
        const monthKey = format(pointDate, "MM/yyyy");
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + (point.value || 0));
      }
    });

    const allMonths: string[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(targetYear, i, 1);
      allMonths.push(format(monthDate, "MM/yyyy"));
    }

    chartData = allMonths.map((month) => ({
      date: month,
      value: monthlyData.get(month) || 0,
    }));
    
    description = `Thống kê theo năm ${targetYear} (12 tháng)`;
  }

  const chartType = type === "deployments" ? "Deployments" : type === "users" ? "Users" : "Webhooks";
  const hasData = data.length > 0;

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-50">
              Xu hướng {chartType}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[300px] text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <p className="text-sm">Chưa có dữ liệu trong khoảng thời gian này</p>
              <p className="text-xs mt-1">Vui lòng chọn &quot;Tháng&quot; hoặc &quot;Năm&quot; để xem dữ liệu</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} /> 
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPreviousValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="date"
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
            {/* Current year */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

