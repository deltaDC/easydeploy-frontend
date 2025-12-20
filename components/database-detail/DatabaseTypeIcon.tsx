"use client";

import { motion } from "framer-motion";
import { DatabaseType } from "@/types/database.type";
import { DB_TYPE_COLORS } from "./types";

// SVG Icons for each database type
const PostgresIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M17.5 8.5c-.5-2-2.5-3-5-3s-4.5 1-5 3c-.5 2 0 5 1 7s2.5 3 4 3 3-1 4-3 1.5-5 1-7z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <ellipse cx="10" cy="10" rx="1" ry="1.5" fill="currentColor" />
    <path d="M14 12c0 1-1 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MongoDBIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path
      d="M12 2C8 2 5 5 5 9c0 3 2 6 4 8l2 3c.5.5 1 .5 1.5 0l2-3c2-2 4-5 4-8 0-4-3-7-7-7z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 2C8 2 5 5 5 9c0 3 2 6 4 8l2 3c.5.5 1 .5 1.5 0l2-3c2-2 4-5 4-8 0-4-3-7-7-7z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M12 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MySQLIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path
      d="M4 6h16v12H4z"
      fill="currentColor"
      opacity="0.2"
      rx="2"
    />
    <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 14h2M14 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const RedisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path
      d="M12 4L4 8v8l8 4 8-4V8l-8-4z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 4L4 8v8l8 4 8-4V8l-8-4z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M4 8l8 4 8-4M12 12v8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const iconComponents: Record<DatabaseType, React.FC> = {
  [DatabaseType.POSTGRESQL]: PostgresIcon,
  [DatabaseType.MONGODB]: MongoDBIcon,
  [DatabaseType.MYSQL]: MySQLIcon,
  [DatabaseType.REDIS]: RedisIcon,
};

interface DatabaseTypeIconProps {
  type: DatabaseType;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  showGlow?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function DatabaseTypeIcon({
  type,
  size = "md",
  animated = true,
  showGlow = true,
}: DatabaseTypeIconProps) {
  const colors = DB_TYPE_COLORS[type];
  const IconComponent = iconComponents[type];

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={animated ? { scale: 1, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Glow effect */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: colors.glow }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Glass circle background */}
      <div
        className="absolute inset-0 rounded-full glass-card-light"
        style={{
          background: `linear-gradient(135deg, ${colors.bg}, rgba(255,255,255,0.1))`,
          border: `1px solid ${colors.border}`,
        }}
      />

      {/* Icon */}
      <div
        className={`relative z-10 ${size === "sm" ? "w-5 h-5" : size === "md" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-14 h-14"}`}
        style={{ color: colors.primary }}
      >
        <IconComponent />
      </div>
    </motion.div>
  );
}

export default DatabaseTypeIcon;

