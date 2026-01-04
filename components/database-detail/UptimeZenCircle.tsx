"use client";

import { motion } from "framer-motion";

interface UptimeZenCircleProps {
  uptimeSeconds: number;
  size?: number;
}

export function UptimeZenCircle({ uptimeSeconds, size = 160 }: UptimeZenCircleProps) {
  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const radius = (size - 20) / 2;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Enso Circle - Calligraphic brush stroke style */}
        <motion.svg
          className="absolute inset-0"
          width={size}
          height={size}
          animate={{ rotate: 360 }}
          transition={{
            duration: 300, // Very slow rotation - 5 minutes per full rotation
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            filter: "drop-shadow(0 0 8px rgba(146, 175, 173, 0.3))",
          }}
        >
          {/* Enso circle path - imperfect, hand-drawn style */}
          <motion.path
            d={`M ${center + radius * 0.7} ${center - radius * 0.3}
                A ${radius} ${radius} 0 1 1 ${center - radius * 0.7} ${center + radius * 0.3}
                A ${radius * 0.95} ${radius * 0.95} 0 1 0 ${center + radius * 0.65} ${center - radius * 0.25}`}
            fill="none"
            stroke="rgba(146, 175, 173, 0.4)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: "0.1 0.1", // Slight texture
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Brush texture overlay - subtle */}
          <motion.path
            d={`M ${center + radius * 0.7} ${center - radius * 0.3}
                A ${radius} ${radius} 0 1 1 ${center - radius * 0.7} ${center + radius * 0.3}
                A ${radius * 0.95} ${radius * 0.95} 0 1 0 ${center + radius * 0.65} ${center - radius * 0.25}`}
            fill="none"
            stroke="rgba(146, 175, 173, 0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.5}
          />
        </motion.svg>

        {/* Center content with uptime */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-serif font-semibold text-charcoal"
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {formatUptime(uptimeSeconds)}
          </motion.span>
          <span className="text-xs text-charcoal/40 mt-1 font-serif">Uptime</span>
        </div>
      </div>

      {/* Zen breathing text */}
      <motion.p
        className="mt-4 text-xs text-charcoal/30 font-serif italic"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Bền bỉ qua thời gian
      </motion.p>
    </div>
  );
}

export default UptimeZenCircle;

