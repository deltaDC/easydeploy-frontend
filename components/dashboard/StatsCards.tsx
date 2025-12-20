"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, XCircle, Pause } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatsCardsProps {
  stats: DashboardStats;
}

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue}</span>;
}

// Generate sample sparkline data
function generateSparklineData(value: number) {
  const data = [];
  const baseValue = Math.max(0, value - 5);
  for (let i = 0; i < 12; i++) {
    data.push({
      value: baseValue + Math.random() * 10 + (value / 12) * i,
    });
  }
  return data;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const cards = [
    {
      title: 'Tổng số Apps',
      value: stats.totalApplications,
      icon: Activity,
      color: 'text-misty-sage',
      bgColor: 'bg-misty-sage/10',
      shadowColor: 'shadow-misty-sage-md',
      sparklineColor: '#92AFAD',
    },
    {
      title: 'Thành công',
      value: stats.runningApplications,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-200/20',
      shadowColor: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)]',
      sparklineColor: '#10B981',
      description: 'Thành công',
    },
    {
      title: 'Đang triển khai',
      value: stats.stoppedApplications,
      icon: Pause,
      color: 'text-soft-blue',
      bgColor: 'bg-soft-blue/10',
      shadowColor: 'shadow-misty-sage-sm',
      sparklineColor: '#B9C9D6',
      description: 'Chờ xử lý',
    },
    {
      title: 'Lỗi/Crash',
      value: stats.failedApplications,
      icon: XCircle,
      color: 'text-rose-soft',
      bgColor: 'bg-rose-light/20',
      shadowColor: 'shadow-[0_10px_30px_-10px_rgba(252,165,165,0.15)]',
      sparklineColor: '#FCA5A5',
      description: 'Thất bại',
    },
  ];

  return (
    <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const sparklineData = generateSparklineData(card.value);
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="bg-white/60 backdrop-blur-xl border-0 rounded-3xl shadow-inner-glow-soft relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              {/* Colored shadow */}
              <div className={`absolute inset-0 ${card.shadowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-3xl`} />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
                <CardTitle className="text-sm font-medium text-charcoal">
                  {card.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.5} />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-semibold text-charcoal mb-3">
                  <AnimatedNumber value={card.value} />
                </div>
                
                {/* Sparkline Chart */}
                <div className="h-[40px] w-full min-w-0 min-h-[40px] -mx-2 mb-2">
                  <ResponsiveContainer width="100%" height="100%" minHeight={40} minWidth={0}>
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={card.sparklineColor}
                        strokeWidth={1.5}
                        dot={false}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {card.description && (
                  <p className="text-xs text-charcoal/60 mt-2">
                    {card.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
