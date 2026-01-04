"use client";

import { motion } from "framer-motion";

interface LiquidStorageBarProps {
  used: number;
  total: number;
  showLabel?: boolean;
  height?: number;
  diskUsageBytes?: number;
  diskTotalBytes?: number;
  databaseSizeBytes?: number;
  storageGb?: number; 
}

export function LiquidStorageBar({
  used,
  total,
  showLabel = true,
  height = 8,
  diskUsageBytes,
  diskTotalBytes,
  databaseSizeBytes,
  storageGb,
}: LiquidStorageBarProps) {
  let actualUsed: number;
  let actualTotal: number;
  let dataUsed: number | undefined;
  let dataTotal: number | undefined;
  
  if (diskUsageBytes !== undefined && diskTotalBytes !== undefined && diskTotalBytes > 0) {
    actualUsed = diskUsageBytes / (1024 * 1024 * 1024);
    actualTotal = diskTotalBytes / (1024 * 1024 * 1024);
    
    if (databaseSizeBytes !== undefined) {
      dataUsed = databaseSizeBytes / (1024 * 1024 * 1024);
      dataTotal = storageGb;
    }
  } else {
    actualUsed = used;
    actualTotal = total;
    
    if (databaseSizeBytes !== undefined && storageGb !== undefined) {
      dataUsed = databaseSizeBytes / (1024 * 1024 * 1024);
      dataTotal = storageGb;
    }
  }
  
  const percentage = Math.min((actualUsed / actualTotal) * 100, 100);
  const isHigh = percentage > 80;
  const isMedium = percentage > 60 && percentage <= 80;

  const getColor = () => {
    if (isHigh) return { primary: "#EF4444", glow: "rgba(239, 68, 68, 0.5)" };
    if (isMedium) return { primary: "#F59E0B", glow: "rgba(245, 158, 11, 0.5)" };
    return { primary: "#10B981", glow: "rgba(16, 185, 129, 0.5)" };
  };

  const colors = getColor();

  return (
    <div className="w-full">    
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 20px rgba(146, 175, 173, 0.1)",
          borderRadius: height > 10 ? "999px" : "4px", 
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${colors.primary}DD, ${colors.primary}FF, ${colors.primary}DD)`,
            boxShadow: `0 0 20px ${colors.glow}, inset 0 0 10px ${colors.primary}80`,
            filter: "blur(0.5px)", 
          }}
        >
          <motion.div
            className="absolute top-0 left-0 right-0"
            style={{
              height: "40%",
              background: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)`,
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            }}
            animate={{
              y: [0, -2, 0],
              scaleX: [1, 1.02, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)`,
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "200% 0%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute w-1 h-1 rounded-full bg-white/50"
            style={{ left: "20%", bottom: "20%" }}
            animate={{
              y: [0, -4, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-0.5 h-0.5 rounded-full bg-white/40"
            style={{ left: "60%", bottom: "30%" }}
            animate={{
              y: [0, -3, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </motion.div>

        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 50%)",
          }}
        />
      </div>

      {showLabel && (
        <div className="space-y-1 mt-1.5">
          <div className="flex justify-between text-xs text-charcoal/60">
            <span>Disk: {actualUsed.toFixed(2)} GB</span>
            <span>{actualTotal.toFixed(2)} GB</span>
          </div>
          {dataUsed !== undefined && dataTotal !== undefined && (
            <div className="flex justify-between text-xs text-charcoal/40">
              <span>Dữ liệu: {dataUsed.toFixed(2)} GB</span>
              <span>{dataTotal} GB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LiquidStorageBar;

