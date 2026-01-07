"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, XCircle, Pause, Loader2 } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

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
      gradientFrom: 'from-emerald-600',
      gradientTo: 'to-emerald-400',
    },
    {
      title: 'Đang chạy',
      value: stats.runningApplications,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-100/15',
      gradientFrom: 'from-emerald-600',
      gradientTo: 'to-emerald-400',
    },
    {
      title: 'Đang deploy',
      value: stats.deployingApplications,
      icon: Loader2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-100/15',
      gradientFrom: 'from-cyan-600',
      gradientTo: 'to-cyan-400',
      showSpinner: true,
    },
    {
      title: 'Lỗi/Crash',
      value: stats.failedApplications,
      icon: XCircle,
      color: 'text-rose-300',
      bgColor: 'bg-rose-100/15',
      gradientFrom: 'from-rose-600',
      gradientTo: 'to-rose-400',
      hasError: stats.failedApplications > 0,
    },
  ];

  return (
    <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="h-full"
          >
            <Card 
              className={`
                relative overflow-hidden group transition-all duration-300
                rounded-3xl h-full flex flex-col
                ${card.hasError ? 'bg-red-50/50' : 'bg-white/40'}
                backdrop-blur-[20px]
                border border-white/60
                shadow-[0_8px_32px_rgba(31,38,135,0.1)]
                hover:ring-2 hover:ring-emerald-100 hover:ring-opacity-50
                hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)]
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
                <CardTitle className="text-sm font-medium text-charcoal">
                  {card.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                  {card.showSpinner && card.value > 0 ? (
                    <Icon className={`h-5 w-5 ${card.color} animate-spin`} strokeWidth={1.5} />
                  ) : (
                    <Icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.5} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                <div className={`text-4xl font-bold bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} bg-clip-text text-transparent mb-3`}>
                  <AnimatedNumber value={card.value} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
