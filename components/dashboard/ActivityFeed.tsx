"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Activity, GitBranch, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'deploy' | 'success' | 'error' | 'update';
  message: string;
  timestamp: Date;
  appName?: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

// Sample activities if none provided
const sampleActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'deploy',
    message: 'Đã triển khai ứng dụng',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    appName: 'My App',
  },
  {
    id: '2',
    type: 'success',
    message: 'Triển khai thành công',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    appName: 'My App',
  },
  {
    id: '3',
    type: 'update',
    message: 'Đã cập nhật cấu hình',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    appName: 'My App',
  },
  {
    id: '4',
    type: 'error',
    message: 'Lỗi triển khai',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    appName: 'My App',
  },
];

const activityIcons = {
  deploy: GitBranch,
  success: CheckCircle,
  error: XCircle,
  update: Zap,
};

const activityColors = {
  deploy: 'text-misty-sage',
  success: 'text-emerald-500',
  error: 'text-rose-soft',
  update: 'text-soft-blue',
};

export function ActivityFeed({ activities = sampleActivities }: ActivityFeedProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <Card className="bg-white/60 backdrop-blur-xl border-0 rounded-3xl shadow-inner-glow-soft relative overflow-hidden">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
          <Activity className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div ref={containerRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-misty-sage/30 via-misty-sage/20 to-transparent" />
          
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative flex items-start gap-4"
                >
					{/* Dew drop indicator */}
					<div className="relative z-10 flex-shrink-0">
						<div className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-sm border ${
							activity.type === 'deploy' ? 'bg-misty-sage/10 border-misty-sage/20' :
							activity.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
							activity.type === 'error' ? 'bg-rose-soft/10 border-rose-soft/20' :
							'bg-soft-blue/10 border-soft-blue/20'
						}`}>
							<Icon className={`h-5 w-5 ${colorClass}`} strokeWidth={1.5} />
						</div>
						{/* Glow effect */}
						<div className={`absolute inset-0 rounded-full blur-md animate-pulse ${
							activity.type === 'deploy' ? 'bg-misty-sage/20' :
							activity.type === 'success' ? 'bg-emerald-500/20' :
							activity.type === 'error' ? 'bg-rose-soft/20' :
							'bg-soft-blue/20'
						}`} />
					</div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-charcoal mb-1">
                      {activity.message}
                      {activity.appName && (
                        <span className="text-charcoal/60 font-normal"> - {activity.appName}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-charcoal/60">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      <span>
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

