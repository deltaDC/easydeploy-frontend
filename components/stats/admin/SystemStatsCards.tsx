"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Server, 
  Activity, 
  Webhook
} from "lucide-react";
import type { SystemStatsSummary } from "@/types/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  formatNumber
} from "@/utils/stats.utils";

interface SystemStatsCardsProps {
  summary: SystemStatsSummary | null;
  isLoading?: boolean;
}

export const SystemStatsCards = memo(function SystemStatsCards({ 
  summary, 
  isLoading 
}: SystemStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      title: "Tổng số Users",
      value: summary.totalUsers,
      activeValue: summary.activeUsers,
      icon: Users,
      color: "text-sky-500",
      bgColor: "bg-sky-50 dark:bg-sky-900/20",
      description: `${summary.activeUsers} đang hoạt động`,
    },
    {
      title: "Ứng dụng",
      value: summary.totalApplications,
      activeValue: summary.runningApplications,
      icon: Server,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: `${summary.runningApplications} đang chạy`,
    },
    {
      title: "Deployments",
      value: summary.totalDeployments,
      successValue: summary.successfulDeployments,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      description: `${summary.successfulDeployments} thành công`,
      successRate: summary.successRate,
    },
    {
      title: "Webhook Events",
      value: summary.totalWebhookEvents,
      successValue: summary.successfulWebhookEvents,
      icon: Webhook,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: `${summary.successfulWebhookEvents} thành công`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.title}
                </h3>
                <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-3xl font-bold ${index === 0 ? 'text-sky-500' : 'text-slate-900 dark:text-slate-50'}`}>
                  {formatNumber(card.value)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

