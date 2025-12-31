"use client";

import { motion } from "framer-motion";

interface LiquidGaugeProps {
  value: number; // 0-100 percentage
  label: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LiquidGauge({ value, label, size = "md", color = "#10B981" }: LiquidGaugeProps) {
  const sizeConfig = {
    sm: { container: "w-24 h-24", text: "text-xs" },
    md: { container: "w-32 h-32", text: "text-sm" },
    lg: { container: "w-40 h-40", text: "text-base" },
  };

  const config = sizeConfig[size];
  const percentage = Math.min(Math.max(value, 0), 100);
  const waterLevel = 100 - percentage; // Invert so water fills from bottom

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${config.container} rounded-full overflow-hidden`}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Water fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          initial={{ height: "0%" }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: `linear-gradient(180deg, ${color}CC, ${color}FF)`,
            boxShadow: `inset 0 0 20px ${color}80`,
          }}
        >
          {/* Water surface with ripples */}
          <motion.div
            className="absolute top-0 left-0 right-0"
            style={{
              height: "20%",
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
          
          {/* Bubbles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: `${4 + i * 2}px`,
                height: `${4 + i * 2}px`,
                left: `${20 + i * 30}%`,
                bottom: `${10 + i * 15}%`,
              }}
              animate={{
                y: [0, -20 - i * 10, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className={`font-bold text-charcoal ${config.text}`} style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className={`mt-2 text-charcoal/60 ${config.text}`}>{label}</span>
    </div>
  );
}

export default LiquidGauge;

