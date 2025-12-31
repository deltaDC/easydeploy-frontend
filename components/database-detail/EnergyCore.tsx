"use client";

import { motion } from "framer-motion";
import { DatabaseType } from "@/types/database.type";
import { DB_TYPE_COLORS } from "./types";
import { DatabaseTypeIcon } from "./DatabaseTypeIcon";

interface EnergyCoreProps {
  type: DatabaseType;
  memoryMb?: number;
  storageGb?: number;
  isDeploying?: boolean;
  onDeployComplete?: () => void;
}

export function EnergyCore({ 
  type, 
  memoryMb = 256, 
  storageGb = 1,
  isDeploying = false,
  onDeployComplete 
}: EnergyCoreProps) {
  const colors = DB_TYPE_COLORS[type];
  
  // Calculate scale and glow intensity based on resources
  const memoryScale = Math.min(1 + (memoryMb / 2048) * 0.5, 1.5); // Max 1.5x scale
  const storageScale = Math.min(1 + (storageGb / 10) * 0.3, 1.3); // Max 1.3x scale
  const finalScale = (memoryScale + storageScale) / 2;
  const glowIntensity = Math.min(0.3 + (memoryMb / 2048) * 0.4, 0.7);

  // Handle deploy animation
  if (isDeploying) {
    // Trigger implode/explode animation
    setTimeout(() => {
      if (onDeployComplete) {
        onDeployComplete();
      }
    }, 2000);
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Energy Core - Rotating seed of life */}
      <motion.div
        className="relative"
        animate={isDeploying ? {
          scale: [1, 0.3, 0, 1.5, 1],
          opacity: [1, 0.8, 0, 1, 1],
          y: [0, 0, -100, 0, 0],
        } : {
          rotate: 360,
          scale: finalScale,
        }}
        transition={isDeploying ? {
          duration: 2,
          ease: "easeInOut",
        } : {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: "120px",
          height: "120px",
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.glow}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
            boxShadow: `0 0 60px ${colors.glow}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [glowIntensity, glowIntensity * 1.5, glowIntensity],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle energy sphere */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${colors.primary}80, ${colors.primary}40)`,
            boxShadow: `inset 0 0 30px rgba(255,255,255,0.5), 0 0 40px ${colors.glow}60`,
          }}
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner core with icon */}
        <div
          className="absolute inset-8 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${colors.primary}60, ${colors.primary}20)`,
            boxShadow: `inset 0 0 20px ${colors.primary}80`,
          }}
        >
          <DatabaseTypeIcon type={type} size="lg" showGlow={true} />
        </div>

        {/* Particle effects */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: "4px",
              height: "4px",
              background: colors.primary,
              left: "50%",
              top: "50%",
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
            animate={{
              x: [
                0,
                Math.cos((i * Math.PI * 2) / 6) * 80,
                Math.cos((i * Math.PI * 2) / 6) * 100,
                Math.cos((i * Math.PI * 2) / 6) * 80,
                0,
              ],
              y: [
                0,
                Math.sin((i * Math.PI * 2) / 6) * 80,
                Math.sin((i * Math.PI * 2) / 6) * 100,
                Math.sin((i * Math.PI * 2) / 6) * 80,
                0,
              ],
              opacity: [0, 1, 0.8, 1, 0],
              scale: [0, 1, 1.2, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* Light trail effect when deploying */}
      {isDeploying && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="absolute w-1 h-32 rounded-full"
            style={{
              background: `linear-gradient(to top, ${colors.glow}, transparent)`,
              boxShadow: `0 0 20px ${colors.glow}`,
            }}
            animate={{
              y: [0, -200],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

export default EnergyCore;

