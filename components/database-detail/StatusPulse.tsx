"use client";

import { motion } from "framer-motion";
import { DatabaseStatus } from "@/types/database.type";
import { DB_STATUS_STYLES } from "./types";

interface StatusPulseProps {
  status: DatabaseStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { dot: "w-2 h-2", text: "text-xs", gap: "gap-1.5" },
  md: { dot: "w-2.5 h-2.5", text: "text-sm", gap: "gap-2" },
  lg: { dot: "w-3 h-3", text: "text-base", gap: "gap-2.5" },
};

export function StatusPulse({ status, showLabel = true, size = "md" }: StatusPulseProps) {
  const styles = DB_STATUS_STYLES[status];
  const sizeStyles = sizeConfig[size];
  const isActive = status === DatabaseStatus.RUNNING || status === DatabaseStatus.DEPLOYING;

  return (
    <div className={`flex items-center ${sizeStyles.gap}`}>
      {/* Pulse dot */}
      <div className="relative">
        {/* Outer pulse ring */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full`}
            style={{ backgroundColor: styles.color }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.6, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.8, 1],
            }}
          />
        )}

        {/* Inner dot */}
        <motion.div
          className={`relative ${sizeStyles.dot} rounded-full`}
          style={{ backgroundColor: styles.color }}
          animate={
            isActive
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={`${sizeStyles.text} font-medium`}
          style={{ color: styles.color }}
        >
          {styles.labelVi}
        </span>
      )}
    </div>
  );
}

export default StatusPulse;

