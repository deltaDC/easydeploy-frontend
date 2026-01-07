"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Server, Hash, HardDrive, Calendar, Activity, Clock } from "lucide-react";
import { Database as DatabaseType, DatabaseStatus } from "@/types/database.type";
import { InfoPearl } from "./InfoPearl";
import { UptimeZenCircle } from "./UptimeZenCircle";
import { GlassPill } from "./GlassPill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { isDockerInternalHost } from "@/utils/hostValidation";

interface DatabaseOverviewTabProps {
  database: DatabaseType;
}

// Helper to calculate uptime - pure function
function calculateUptime(createdAt: string): number {
  if (!createdAt) return 0;
  
  let dateObj: Date;
  const hasTimezone = createdAt.includes('Z') || /[+-]\d{2}:\d{2}$/.test(createdAt);
  
  if (!hasTimezone) {
    dateObj = new Date(createdAt + 'Z');
  } else {
    dateObj = new Date(createdAt);
  }
  
  const createdTime = dateObj.getTime();
  const now = Date.now();
  return Math.floor((now - createdTime) / 1000);
}

export function DatabaseOverviewTab({ database }: DatabaseOverviewTabProps) {
  // Initialize with a function to avoid calling Date.now() during render
  const [uptimeSeconds, setUptimeSeconds] = useState(() => 
    calculateUptime(database.createdAt)
  );

  // Update uptime periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds(calculateUptime(database.createdAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [database.createdAt]);

  const externalHost = database.externalHost;
  const isDockerHost = isDockerInternalHost(externalHost);
  const hostDisplay = isDockerHost 
    ? "Chưa cấu hình public host" 
    : (externalHost || "Chưa cấu hình");
  const isHostCopyable = !isDockerHost && !!externalHost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Database Name Header with Serif Font */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-charcoal mb-4">
          {database.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          <GlassPill label="Version" value={database.version} />
          {database.port && <GlassPill label="Port" value={String(database.port)} />}
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Information Cards */}
        <div className="space-y-4">
          {/* Info Pearls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoPearl
              icon={Database}
              label="Loại"
              value={database.type}
            />
            <InfoPearl
              icon={Server}
              label="Máy chủ"
              value={hostDisplay}
              copyable={isHostCopyable}
            />
            <InfoPearl
              icon={Database}
              label="Tên Database"
              value={database.databaseName || database.name}
              copyable
            />
            <InfoPearl
              icon={Calendar}
              label="Ngày tạo"
              value={formatDateDDMMYYYYHHMMSS(database.createdAt)}
            />
          </div>

          {/* Health Status - InfoPearl style */}
          <div className="grid grid-cols-1 gap-4">
            <InfoPearl
              icon={Activity}
              label="Tình trạng sức khỏe"
              value={
                database.status === DatabaseStatus.RUNNING
                  ? "Hệ thống hoạt động bình thường"
                  : database.status === DatabaseStatus.STOPPED
                  ? "Hệ thống đã dừng"
                  : database.status === DatabaseStatus.DEPLOYING
                  ? "Đang triển khai..."
                  : database.status === DatabaseStatus.FAILED
                  ? "Triển khai thất bại"
                  : database.status === DatabaseStatus.PENDING
                  ? "Đang chờ xử lý"
                  : database.status === DatabaseStatus.DELETING
                  ? "Đang xóa"
                  : "Không xác định"
              }
            />
          </div>
        </div>

        {/* Right Side - Uptime Card */}
        <Card className="glass-card border-0 shadow-sage-glow h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
              <Clock className="w-5 h-5 text-misty-sage" strokeWidth={1.5} />
              Thời gian hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-6">
            <UptimeZenCircle uptimeSeconds={uptimeSeconds} size={140} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default DatabaseOverviewTab;
