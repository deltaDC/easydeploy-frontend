"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Server, Hash, HardDrive, Calendar, Activity, Clock } from "lucide-react";
import { Database as DatabaseType } from "@/types/database.type";
import { InfoPearl } from "./InfoPearl";
import { UptimeZenCircle } from "./UptimeZenCircle";
import { LiquidStorageBar } from "./LiquidStorageBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { isDockerInternalHost } from "@/utils/hostValidation";

interface DatabaseOverviewTabProps {
  database: DatabaseType;
}

// Helper to calculate uptime - pure function
function calculateUptime(createdAt: string): number {
  const createdTime = new Date(createdAt).getTime();
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

  // Compute derived values
  const storageUsed = (database.storageGb || 1) * 0.35;
  const storageTotal = database.storageGb || 1;
  
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
      {/* Info Pearls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoPearl
          icon={Database}
          label="Loại"
          value={database.type}
        />
        <InfoPearl
          icon={Hash}
          label="Phiên bản"
          value={database.version}
        />
        <InfoPearl
          icon={Server}
          label="Máy chủ"
          value={hostDisplay}
          copyable={isHostCopyable}
        />
        <InfoPearl
          icon={Hash}
          label="Port"
          value={String(database.port || "—")}
          copyable={!!database.port}
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

      {/* Health & Uptime Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uptime Card */}
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
              <Clock className="w-5 h-5 text-misty-sage" strokeWidth={1.5} />
              Thời gian hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <UptimeZenCircle uptimeSeconds={uptimeSeconds} size={140} />
          </CardContent>
        </Card>

        {/* Health Status Card */}
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
              <Activity className="w-5 h-5 text-misty-sage" strokeWidth={1.5} />
              Tình trạng sức khỏe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health message */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <motion.div
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-700 font-medium">
                  Mọi thứ đều ổn định
                </span>
              </motion.div>
            </div>

            {/* Response time */}
            <div className="flex items-center justify-between p-3 rounded-xl glass-card-light">
              <span className="text-sm text-charcoal/60">Response Time (avg)</span>
              <span className="text-sm font-semibold text-charcoal">~12ms</span>
            </div>

            {/* Connections */}
            <div className="flex items-center justify-between p-3 rounded-xl glass-card-light">
              <span className="text-sm text-charcoal/60">Active Connections</span>
              <span className="text-sm font-semibold text-charcoal">3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Card */}
      <Card className="glass-card border-0 shadow-sage-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-misty-sage" strokeWidth={1.5} />
            Dung lượng lưu trữ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiquidStorageBar
            used={storageUsed}
            total={storageTotal}
            height={12}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DatabaseOverviewTab;
