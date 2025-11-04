"use client";

import { TimeSeriesData } from "@/types/monitoring.type";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricChartProps {
  title: string;
  data: TimeSeriesData[];
  unit: string;
  color: string;
}

export function MetricChart({ title, data, unit, color }: MetricChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || latestValue;
  const trend = latestValue - previousValue;
  const trendPercent = previousValue !== 0 ? ((trend / previousValue) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className="flex items-center gap-1 text-xs">
          {trend >= 0 ? (
            <TrendingUp className={`w-3 h-3 ${trend > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          ) : (
            <TrendingDown className="w-3 h-3 text-green-500" />
          )}
          <span className={trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500'}>
            {trend >= 0 ? '+' : ''}{trendPercent}%
          </span>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-2xl font-bold" style={{ color }}>
          {latestValue.toFixed(2)}{unit}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(data[data.length - 1]?.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Simple line chart */}
      <div className="h-16 flex items-end gap-0.5">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 rounded-t transition-all hover:opacity-75"
              style={{
                backgroundColor: color,
                height: `${Math.max(height, 2)}%`,
                opacity: 0.3 + (index / data.length) * 0.7,
              }}
              title={`${point.value.toFixed(2)}${unit} at ${new Date(point.timestamp).toLocaleTimeString()}`}
            />
          );
        })}
      </div>
    </div>
  );
}
