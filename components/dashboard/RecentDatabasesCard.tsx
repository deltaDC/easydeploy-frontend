'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock, Database } from 'lucide-react';
import Link from 'next/link';
import type { RecentDatabase } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RecentDatabasesCardProps {
  databases: RecentDatabase[];
}

export function RecentDatabasesCard({ databases }: RecentDatabasesCardProps) {
  const getStatusBadge = (db: RecentDatabase) => {
    // Prioritize containerStatus over database status
    if (db.containerStatus) {
      const statusLower = db.containerStatus.toLowerCase();
      const isRunning = statusLower.includes('running') || statusLower.includes('up');
      const isStopped = statusLower.includes('exited') || statusLower.includes('stopped') || statusLower.includes('created');
      
      if (isRunning) {
        return (
          <Badge variant="default" className="gap-1.5 bg-emerald-100/50 text-emerald-700 border-emerald-200/30">
            <div className="relative h-2.5 w-2.5">
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <div className="absolute inset-0 rounded-full bg-emerald-500" />
            </div>
            Đang chạy
          </Badge>
        );
      } else if (isStopped) {
        return (
          <Badge variant="secondary" className="gap-1.5 bg-gray-100/50 text-gray-700 border-gray-200/30">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            Đã dừng
          </Badge>
        );
      }
    }
    
    // Fallback to database status
    const statusLower = db.status.toLowerCase();
    if (statusLower === 'running') {
      return (
        <Badge variant="default" className="gap-1.5 bg-emerald-100/50 text-emerald-700 border-emerald-200/30">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Đang chạy
        </Badge>
      );
    } else if (statusLower === 'stopped') {
      return (
        <Badge variant="secondary" className="gap-1.5 bg-gray-100/50 text-gray-700 border-gray-200/30">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
          Đã dừng
        </Badge>
      );
    } else if (statusLower === 'pending') {
      return (
        <Badge variant="outline" className="gap-1.5 bg-yellow-100/50 text-yellow-700 border-yellow-200/30">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          Chờ xử lý
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="gap-1.5 bg-red-100/50 text-red-700 border-red-200/30">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Lỗi
        </Badge>
      );
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'POSTGRESQL': 'PostgreSQL',
      'MYSQL': 'MySQL',
      'MONGODB': 'MongoDB',
      'REDIS': 'Redis',
    };
    return typeMap[type] || type;
  };

  if (databases.length === 0) {
    return (
      <Card className="bg-white/40 backdrop-blur-[20px] border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <CardHeader>
          <CardTitle className="text-charcoal">Cơ sở dữ liệu gần đây</CardTitle>
          <CardDescription className="text-charcoal/60">5 cơ sở dữ liệu được triển khai gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-3">
            <div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Chưa có cơ sở dữ liệu nào được triển khai
            </p>
            <Link href="/databases/new">
              <span className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer">
                Tạo database đầu tiên
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/40 backdrop-blur-[20px] border border-white/60 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-charcoal">Cơ sở dữ liệu gần đây</CardTitle>
          <CardDescription className="text-charcoal/60">5 cơ sở dữ liệu được triển khai gần nhất</CardDescription>
        </div>
        <Link 
          href="/databases" 
          className="text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {databases.map((db, index) => (
            <motion.div
              key={db.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div
                className="
                  flex items-center gap-4 p-4 rounded-2xl
                  bg-white/40 backdrop-blur-[20px] border border-white/60
                  hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)]
                  hover:-translate-y-1 hover:ring-2 hover:ring-emerald-100 hover:ring-opacity-50
                  transition-all duration-300
                "
              >
                {/* Database Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 flex items-center justify-center">
                  <Database className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                </div>

                {/* Database Info */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/databases/${db.id}`}
                      className="font-medium text-charcoal hover:text-emerald-600 transition-colors truncate"
                    >
                      {db.name}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(db.type)}
                      {db.version && ` ${db.version}`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-charcoal/50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {formatDistanceToNow(new Date(db.updatedAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(db)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

