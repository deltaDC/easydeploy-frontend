"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, FileText } from "lucide-react";

interface EmptyStateProps {
  type?: "stats" | "deployments" | "data";
  message?: string;
  description?: string;
}

export function EmptyState({ 
  type = "data", 
  message,
  description 
}: EmptyStateProps) {
  const messages = {
    stats: {
      title: "Chưa có dữ liệu thống kê",
      desc: "Dữ liệu sẽ xuất hiện khi có hoạt động trong hệ thống",
    },
    deployments: {
      title: "Chưa có deployments",
      desc: "Chưa có lịch sử deployment nào trong khoảng thời gian này",
    },
    data: {
      title: "Không có dữ liệu",
      desc: "Chưa có dữ liệu để hiển thị",
    },
  };

  const currentMessage = message 
    ? { title: message, desc: description || "" }
    : messages[type];

  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
          {type === "stats" ? (
            <BarChart3 className="h-8 w-8 text-slate-400" />
          ) : (
            <FileText className="h-8 w-8 text-slate-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          {currentMessage.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
          {currentMessage.desc}
        </p>
      </CardContent>
    </Card>
  );
}

