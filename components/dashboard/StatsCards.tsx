"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, XCircle, Pause } from 'lucide-react';
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
      shadowColor: 'shadow-misty-sage-md',
    },
    {
      title: 'Thành công',
      value: stats.runningApplications,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-100/15',
      shadowColor: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)]',
      description: 'Thành công',
    },
    {
      title: 'Đang triển khai',
      value: stats.stoppedApplications,
      icon: Pause,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-100/15',
      shadowColor: 'shadow-misty-sage-sm',
      description: 'Chờ xử lý',
    },
    {
      title: 'Lỗi/Crash',
      value: stats.failedApplications,
      icon: XCircle,
      color: 'text-rose-300',
      bgColor: 'bg-rose-100/15',
      shadowColor: 'shadow-[0_10px_30px_-10px_rgba(252,165,165,0.15)]',
      description: 'Thất bại',
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
          >
            <Card className="bg-white/50 backdrop-blur-2xl border border-white/20 rounded-3xl colored-shadow-sage relative overflow-hidden group hover:colored-shadow-sage-hover transition-all duration-300">
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
                
                {card.description && (
                  <p className="text-xs text-charcoal/60">
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
