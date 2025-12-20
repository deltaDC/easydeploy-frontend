"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface UptimeZenCircleProps {
  uptimeSeconds: number;
  size?: number;
}

export function UptimeZenCircle({ uptimeSeconds, size = 120 }: UptimeZenCircleProps) {
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

        {/* SVG rotating ring */}
        <motion.svg
          className="absolute inset-0"
          width={size}
          height={size}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60, // 1 rotation per minute - very slow "breathing"
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(146, 175, 173, 0.2)"
            strokeWidth="2"
          />

          {/* Progress arc - subtle indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(146, 175, 173, 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.75}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />

          {/* Glowing dot at the end */}
          <motion.circle
            cx={size / 2}
            cy={4}
            r="3"
            fill="#92AFAD"
            filter="url(#glow)"
          />

          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
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

export default UptimeZenCircle;

