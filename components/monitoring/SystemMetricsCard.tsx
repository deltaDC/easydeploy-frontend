"use client";

import { SystemMetrics } from "@/types/monitoring.type";
import { Server, Cpu, Clock, Database } from "lucide-react";

interface SystemMetricsCardProps {
  metrics: SystemMetrics;
}

export function SystemMetricsCard({ metrics }: SystemMetricsCardProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const connectionUsage = metrics.maxConnections > 0
    ? (metrics.activeConnections / metrics.maxConnections) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">System Resources</h3>
      </div>

      <div className="space-y-4">
        {/* CPU Usage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
            </div>
            <span className="text-sm text-gray-600">
              Process: {metrics.processCpuUsage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                metrics.systemCpuUsage > 80 ? 'bg-red-600' :
                metrics.systemCpuUsage > 60 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(metrics.systemCpuUsage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            System: {metrics.systemCpuUsage.toFixed(1)}% used
          </div>
        </div>

        {/* Database Connections */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">DB Connections</span>
            </div>
            <span className="text-sm text-gray-600">
              {metrics.activeConnections} / {metrics.maxConnections}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                connectionUsage > 80 ? 'bg-red-600' :
                connectionUsage > 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(connectionUsage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {connectionUsage.toFixed(1)}% pool used
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Uptime</span>
          </div>
          <div className="text-2xl font-bold text-indigo-900">
            {formatUptime(metrics.uptimeSeconds)}
          </div>
          <div className="text-xs text-indigo-700 mt-1">
            {metrics.uptimeSeconds.toLocaleString()} seconds
          </div>
        </div>
      </div>
    </div>
  );
}
