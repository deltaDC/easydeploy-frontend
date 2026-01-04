"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Cpu, MemoryStick } from 'lucide-react';
import type { SystemMetrics } from '@/types/dashboard';

interface ResourceMonitorProps {
  metrics?: SystemMetrics;
}

export function ResourceMonitor({ metrics }: ResourceMonitorProps) {
  const cpuUsage = metrics?.cpuUsage || 0;
  const ramUsage = metrics?.ramUsage || 0;

  const cpuData = [
    { name: 'Used', value: cpuUsage },
    { name: 'Free', value: 100 - cpuUsage },
  ];

  const ramData = [
    { name: 'Used', value: ramUsage },
    { name: 'Free', value: 100 - ramUsage },
  ];

  const COLORS = {
    used: '#10B981',
    free: 'rgba(146, 175, 173, 0.2)',
  };

  const renderLabel = (entry: any) => {
    return `${entry.value.toFixed(1)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      <Card className="bg-white/40 backdrop-blur-[20px] border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.1)] hover:ring-2 hover:ring-emerald-100 hover:ring-opacity-50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-charcoal">Tài nguyên hệ thống</CardTitle>
          <CardDescription className="text-charcoal/60">
            CPU và RAM đang sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPU Donut Chart */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-cyan-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-charcoal">CPU</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cpuData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {cpuData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? COLORS.used : COLORS.free}
                        strokeLinecap="round"
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold fill-charcoal"
                  >
                    {cpuUsage.toFixed(1)}%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RAM Donut Chart */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <MemoryStick className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-charcoal">RAM</span>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ramData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {ramData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? COLORS.used : COLORS.free}
                        strokeLinecap="round"
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold fill-charcoal"
                  >
                    {ramUsage.toFixed(1)}%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}




