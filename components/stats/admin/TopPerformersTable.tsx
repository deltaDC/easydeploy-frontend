"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPercentage } from "@/utils/stats.utils";
import type { TopAppDTO } from "@/types/stats";
import { Trophy } from "lucide-react";

interface TopPerformersTableProps {
  topApps: TopAppDTO[];
  isLoading?: boolean;
}

export function TopPerformersTable({ topApps, isLoading }: TopPerformersTableProps) {
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

  if (!topApps || topApps.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Top Apps</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Apps có nhiều deployments nhất
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

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Apps
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Apps có nhiều deployments nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tên App</TableHead>
              <TableHead className="text-right">Deployments</TableHead>
              <TableHead className="text-right">Thành công</TableHead>
              <TableHead className="text-right">Tỷ lệ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topApps.map((app, index) => (
              <TableRow key={app.appId}>
                <TableCell>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold">
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {app.appName}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold">{formatNumber(app.deploymentCount)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {formatNumber(app.successfulDeployments)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      app.successRate >= 90
                        ? "default"
                        : app.successRate >= 70
                        ? "secondary"
                        : "destructive"
                    }
                    className={
                      app.successRate >= 90
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent"
                        : app.successRate >= 70
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent"
                    }
                  >
                    {formatPercentage(app.successRate)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

