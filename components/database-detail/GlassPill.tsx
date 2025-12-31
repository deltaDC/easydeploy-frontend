"use client";

import { motion } from "framer-motion";

interface GlassPillProps {
  label: string;
  value: string | number;
  className?: string;
}

export function GlassPill({ label, value, className = "" }: GlassPillProps) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 0 20px rgba(146, 175, 173, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1)",
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-xs text-charcoal/60 font-medium">{label}</span>
      <span className="text-sm text-charcoal font-semibold">{value}</span>
    </motion.div>
  );
}

export default GlassPill;

