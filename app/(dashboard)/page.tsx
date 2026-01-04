"use client";
import { useDashboardOverview } from '@/hooks/useDashboard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentAppsCard } from '@/components/dashboard/RecentAppsCard';
import { RecentDatabasesCard } from '@/components/dashboard/RecentDatabasesCard';
import { ResourceMonitor } from '@/components/dashboard/ResourceMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, RefreshCw, Rocket, Github, BookOpen, Zap, ArrowRight, Sun } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { overview, isLoading, isError, mutate } = useDashboardOverview();
  const { user } = useAuth();

  const handleRefresh = () => {
    mutate();
  };

  const username = overview?.username || user?.email?.split('@')[0] || 'User';

  if (isError) {
    return (
      <div className="py-6">
        <div className="container-page">
          <Card className="border-destructive bg-white/60 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <p className="text-destructive font-medium">
                  Không thể tải dữ liệu dashboard
                </p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Mesh Gradient Background - 3 Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Blob 1: Xanh Bạc Hà - Top Left */}
        <div 
          className="absolute top-0 left-0 w-[600px] h-[600px] blob-mint animate-blob"
          style={{ filter: 'blur(100px)' }}
        />
        {/* Blob 2: Vàng Nắng Nhạt - Center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blob-yellow animate-blob"
          style={{ filter: 'blur(100px)', animationDelay: '7s' }}
        />
        {/* Blob 3: Xanh Lam Sương - Bottom Right */}
        <div 
          className="absolute bottom-0 right-0 w-[550px] h-[550px] blob-blue animate-blob"
          style={{ filter: 'blur(100px)', animationDelay: '14s' }}
        />
      </div>

      {/* Noise Overlay */}
      <div className="dashboard-noise-overlay" />

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2 relative z-10"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#064E3B]" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            Chào buổi sáng, {username}
          </h1>
          <Sun className="h-6 w-6 text-yellow-400 animate-pulse" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-[#64748B] font-sans">
          Hệ thống của bạn đang vận hành trơn tru trong sương sớm.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="bg-white/60 backdrop-blur-sm border-misty-grey/30"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
        <Button asChild size="sm" className="bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-emerald-md">
          <Link href="/apps/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Deploy mới
          </Link>
        </Button>
      </motion.div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : overview ? (
        <div className="grid gap-6 lg:grid-cols-12 relative z-10">
          {/* Stats Cards - Full Width */}
          <div className="lg:col-span-12">
            <StatsCards stats={overview.stats} />
          </div>

          <div className="lg:col-span-4">
            <ResourceMonitor metrics={overview.systemMetrics} />
          </div>

          {overview.recentApplications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-8"
            >
              <QuickActionsCard />
            </motion.div>
          )}

          {/* Recent Apps - Left Column */}
          <div className={`${overview.recentApplications.length === 0 ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
            <RecentAppsCard 
              apps={overview.recentApplications} 
              onUpdate={handleRefresh} 
            />
          </div>

          {/* Recent Databases - Full Width */}
          {overview.recentDatabases && overview.recentDatabases.length > 0 && (
            <div className="lg:col-span-12">
              <RecentDatabasesCard databases={overview.recentDatabases} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function QuickActionsCard() {
  const quickActions = [
    {
      title: "Tạo ứng dụng đầu tiên",
      description: "Deploy ứng dụng từ GitHub trong vài phút",
      icon: Rocket,
      href: "/apps/new",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      hoverBg: "hover:bg-emerald-500/20",
    },
    {
      title: "Kết nối GitHub",
      description: "Liên kết tài khoản để truy cập repositories",
      icon: Github,
      href: "/apps/new",
      color: "text-charcoal",
      bgColor: "bg-charcoal/10",
      hoverBg: "hover:bg-charcoal/20",
    },
    {
      title: "Xem tài liệu",
      description: "Hướng dẫn chi tiết về cách sử dụng EasyDeploy",
      icon: BookOpen,
      href: "#",
      color: "text-soft-blue",
      bgColor: "bg-soft-blue/10",
      hoverBg: "hover:bg-soft-blue/20",
    },
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-xl border-0 rounded-3xl shadow-inner-glow-soft overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-misty-sage/10">
            <Zap className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-charcoal">Bắt đầu nhanh</h3>
        </div>
        
        <div className="grid gap-3 md:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <div className={`group p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 ${action.hoverBg} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer`}>
                    <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-5 w-5 ${action.color}`} strokeWidth={1.5} />
                    </div>
                    <h4 className="font-medium text-charcoal text-sm mb-1">{action.title}</h4>
                    <p className="text-xs text-charcoal/60 mb-2">{action.description}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-misty-sage group-hover:text-emerald-600 transition-colors">
                      <span>Bắt đầu</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/60 backdrop-blur-xl">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Apps Skeleton */}
      <Card className="bg-white/60 backdrop-blur-xl">
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
