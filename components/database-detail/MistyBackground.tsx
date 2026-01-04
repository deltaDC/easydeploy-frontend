"use client";

import { motion } from "framer-motion";

interface MistyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function MistyBackground({ children, className = "" }: MistyBackgroundProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 misty-mesh-gradient" />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 -z-10 misty-noise-texture opacity-[0.03]" />
      
      {/* Animated Mist Particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              background: i % 3 === 0 
                ? "rgba(230, 239, 236, 0.4)" // Xanh Sage
                : i % 3 === 1
                ? "rgba(167, 243, 208, 0.3)" // Xanh Ngọc
                : "rgba(254, 249, 195, 0.25)", // Vàng Nắng sớm
              left: `${10 + (i * 15)}%`,
              top: `${20 + ((i % 2) * 30)}%`,
            }}
            animate={{
              x: [0, 50 + i * 10, 0],
              y: [0, -30 - i * 5, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2 + i * 0.1, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

export default MistyBackground;





