"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { DeploymentFrequencyData } from '@/types/dashboard';

interface DeploymentFrequencyChartProps {
  data?: DeploymentFrequencyData;
}

export function DeploymentFrequencyChart({ data }: DeploymentFrequencyChartProps) {
  if (!data || !data.dataPoints || data.dataPoints.length === 0) {
    return (
      <Card className="bg-white/40 backdrop-blur-[20px] border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <CardHeader>
          <CardTitle className="text-charcoal">Tần suất triển khai</CardTitle>
          <CardDescription className="text-charcoal/60">
            Không có dữ liệu để hiển thị
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Transform data for Recharts
  const chartData = data.dataPoints.map(point => ({
    timestamp: point.label || point.timestamp,
    value: point.value,
    date: point.timestamp,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/40 backdrop-blur-[20px] border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.1)] hover:ring-2 hover:ring-emerald-100 hover:ring-opacity-50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-charcoal">Tần suất triển khai</CardTitle>
          <CardDescription className="text-charcoal/60">
            Số lượng deployments theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="deploymentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  label={{ value: "Số lần triển khai", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    borderRadius: "12px",
                    color: "#0f172a",
                    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
                  }}
                  cursor={{ stroke: "#10B981", strokeWidth: 2, strokeOpacity: 0.5 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#deploymentGradient)"
                  dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

