"use client";

import { JvmMetrics } from "@/types/monitoring.type";
import { Activity, Cpu, Database, Trash2 } from "lucide-react";

interface JvmMetricsCardProps {
  metrics: JvmMetrics;
}

export function JvmMetricsCard({ metrics }: JvmMetricsCardProps) {
  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(0)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const heapUsedMB = metrics.heapUsed / (1024 * 1024);
  const heapMaxMB = metrics.heapMax / (1024 * 1024);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Bộ nhớ JVM & Luồng</h3>
      </div>

      <div className="space-y-4">
        {/* Heap Memory */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Bộ nhớ Heap</span>
            <span className="text-sm text-gray-600">
              {formatBytes(metrics.heapUsed)} / {formatBytes(metrics.heapMax)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                metrics.heapUsagePercent > 80 ? 'bg-red-600' :
                metrics.heapUsagePercent > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(metrics.heapUsagePercent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.heapUsagePercent.toFixed(1)}% đã sử dụng
          </div>
        </div>

        {/* Non-Heap Memory */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">Non-Heap</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatBytes(metrics.nonHeapUsed)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-gray-600">Luồng</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {metrics.threadsLive}
              <span className="text-sm text-gray-500 ml-1">/ {metrics.threadsPeak}</span>
            </div>
          </div>
        </div>

        {/* GC Stats */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Thu gom rác</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-amber-700">Số lần thu gom</div>
              <div className="font-semibold text-amber-900">{metrics.gcCount}</div>
            </div>
            <div>
              <div className="text-xs text-amber-700">Thời gian tạm dừng</div>
              <div className="font-semibold text-amber-900">{metrics.gcPauseTime} ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
