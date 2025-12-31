"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ZenCircleProps {
  uptimeSeconds: number;
  size?: number;
}

export function ZenCircle({ uptimeSeconds, size = 120 }: ZenCircleProps) {
  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Background circle with glass effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        />

        {/* SVG Enso Circle - slowly rotating */}
        <motion.svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 120, // Very slow rotation
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <defs>
            <filter id="ensoGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feFlood floodColor="#92AFAD" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d={`M${size / 2},${size * 0.15} A${radius * 0.8},${radius * 0.8} 0 1 1 ${size * 0.85},${size / 2} A${radius * 0.8},${radius * 0.8} 0 1 1 ${size / 2},${size * 0.15}`}
            fill="none"
            stroke="#92AFAD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.8}
            strokeDashoffset={circumference * 0.8}
            animate={{ strokeDashoffset: [circumference * 0.8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "url(#ensoGlow)" }}
          />
        </motion.svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock className="w-5 h-5 text-misty-sage mb-1" strokeWidth={1.5} />
          <span className="text-lg font-semibold text-charcoal">
            {formatUptime(uptimeSeconds)}
          </span>
          <span className="text-xs text-charcoal/50">Uptime</span>
        </div>
      </div>

      {/* Breathing indicator text */}
      <motion.p
        className="mt-3 text-xs text-charcoal/40"
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Hệ thống đang hoạt động
      </motion.p>
    </div>
  );
}

export default ZenCircle;

