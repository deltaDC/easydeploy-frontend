"use client";

import { motion } from "framer-motion";

interface LiquidStorageBarProps {
  used: number; // in GB
  total: number; // in GB
  showLabel?: boolean;
  height?: number;
}

export function LiquidStorageBar({
  used,
  total,
  showLabel = true,
  height = 8,
}: LiquidStorageBarProps) {
  const percentage = Math.min((used / total) * 100, 100);
  const isHigh = percentage > 80;
  const isMedium = percentage > 60 && percentage <= 80;

  // Determine color based on usage
  const getColor = () => {
    if (isHigh) return { primary: "#EF4444", glow: "rgba(239, 68, 68, 0.5)" };
    if (isMedium) return { primary: "#F59E0B", glow: "rgba(245, 158, 11, 0.5)" };
    return { primary: "#10B981", glow: "rgba(16, 185, 129, 0.5)" };
  };

  const colors = getColor();

  return (
    <div className="w-full">
      {/* Glass tube container */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Liquid fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${colors.primary}CC, ${colors.primary})`,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
        >
          {/* Animated wave effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
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

          {/* Bubble effects */}
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

        {/* Glass reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex justify-between mt-1.5 text-xs text-charcoal/60">
          <span>{used.toFixed(1)} GB used</span>
          <span>{total} GB total</span>
        </div>
      )}
    </div>
  );
}

export default LiquidStorageBar;

