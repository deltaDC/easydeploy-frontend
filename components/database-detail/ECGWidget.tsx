"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useMemo } from "react";

interface ECGWidgetProps {
  isHealthy: boolean;
  heartRate?: number; // Optional: beats per minute
}

// Simple pseudo-random function using seed (deterministic but appears random)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ECGWidget({ isHealthy, heartRate = 72 }: ECGWidgetProps) {
  // Generate pseudo-random values for unhealthy ECG using seed-based approach
  // This avoids calling Math.random() during render while still producing erratic patterns
  const erraticValues = useMemo(() => {
    if (isHealthy) {
      return [];
    }
    const values: number[] = [];
    // Use a seed based on component instance (could use a ref for true randomness on mount)
    const baseSeed = 12345; // Fixed seed for consistency
    for (let i = 0; i <= 100; i++) {
      const seed = baseSeed + i;
      const random = seededRandom(seed);
      values.push(random * 30 - 15);
    }
    return values;
  }, [isHealthy]);

  // Generate ECG wave path
  const path = useMemo(() => {
    const points: number[] = [];
    const steps = 100;
    const width = 200;
    const height = 60;
    const stepX = width / steps;
    
    for (let i = 0; i <= steps; i++) {
      const x = i * stepX;
      let y = height / 2;
      
      if (isHealthy) {
        // Healthy ECG: smooth waves with occasional spikes
        const baseWave = Math.sin((i / steps) * Math.PI * 8) * 5;
        const spike = i % 20 === 0 ? 15 : 0;
        y = height / 2 + baseWave - spike;
      } else {
        // Unhealthy ECG: erratic, sharp spikes
        const erratic = erraticValues[i] || 0;
        const spike = i % 15 === 0 ? 25 : 0;
        y = height / 2 + erratic - spike;
      }
      
      points.push(x, y);
    }
    
    let pathStr = `M ${points[0]} ${points[1]}`;
    for (let i = 2; i < points.length; i += 2) {
      pathStr += ` L ${points[i]} ${points[i + 1]}`;
    }
    
    return pathStr;
  }, [isHealthy, erraticValues]);
  const color = isHealthy ? "#10B981" : "#EF4444"; // Emerald when healthy, red when unhealthy

  return (
    <div className="relative p-6 rounded-2xl" style={{
      background: "rgba(255, 255, 255, 0.4)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }}>
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5" style={{ color }} strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-charcoal">Tình trạng sức khỏe</h3>
      </div>
      
      {/* ECG Wave Display */}
      <div className="relative h-20 bg-charcoal/5 rounded-lg overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines for medical feel */}
          {[0, 15, 30, 45, 60].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="200"
              y2={y}
              stroke="rgba(0, 0, 0, 0.05)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* ECG Wave */}
          <motion.path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: 1,
              opacity: isHealthy ? [0.8, 1, 0.8] : [0.6, 1, 0.6],
            }}
            transition={{
              pathLength: { duration: 2, ease: "easeInOut" },
              opacity: {
                duration: isHealthy ? 2 : 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
          
          {/* Scanning line effect */}
          <motion.rect
            x="0"
            y="0"
            width="4"
            height="60"
            fill={color}
            opacity="0.6"
            animate={{
              x: [0, 200],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
      </div>
      
      {/* Status text */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-charcoal/60">
          {isHealthy ? "Hệ thống hoạt động bình thường" : "Phát hiện vấn đề"}
        </span>
        {isHealthy && (
          <span className="text-xs font-mono text-emerald-600">
            {heartRate} BPM
          </span>
        )}
      </div>
    </div>
  );
}

export default ECGWidget;

