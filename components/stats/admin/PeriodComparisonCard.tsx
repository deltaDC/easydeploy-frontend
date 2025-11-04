"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumber, formatPercentage, formatPercentageChange, calculatePercentageChange, getTrendIndicator } from "@/utils/stats.utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PeriodComparisonCardProps {
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  metricLabel: string;
  isLoading?: boolean;
}

export function PeriodComparisonCard({
  currentPeriodTotal,
  previousPeriodTotal,
  currentPeriodLabel,
  previousPeriodLabel,
  metricLabel,
  isLoading,
}: PeriodComparisonCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const change = calculatePercentageChange(currentPeriodTotal, previousPeriodTotal);
  const trend = getTrendIndicator(change, true); // Positive is good for deployments

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900 dark:text-slate-50">So sánh với kỳ trước</CardTitle>
        <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
          {metricLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-3">
          {/* Current Period */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{currentPeriodLabel}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatNumber(currentPeriodTotal)}
            </p>
          </div>

          {/* Previous Period */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{previousPeriodLabel}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatNumber(previousPeriodTotal)}
            </p>
          </div>
        </div>

        {/* Change Indicator */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          trend.direction === "up" 
            ? "bg-green-50 dark:bg-green-900/20" 
            : trend.direction === "down"
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-slate-50 dark:bg-slate-900"
        }`}>
          <div className="flex items-center gap-2">
            {trend.direction === "up" && <TrendingUp className={`h-4 w-4 ${trend.color}`} />}
            {trend.direction === "down" && <TrendingDown className={`h-4 w-4 ${trend.color}`} />}
            {trend.direction === "stable" && <Minus className={`h-4 w-4 ${trend.color}`} />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Thay đổi
            </span>
          </div>
          <span className={`text-lg font-bold ${trend.color}`}>
            {formatPercentageChange(change)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

