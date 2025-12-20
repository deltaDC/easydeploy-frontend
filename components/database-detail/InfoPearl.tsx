"use client";

import { motion } from "framer-motion";
import { LucideIcon, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

interface InfoPearlProps {
  icon: LucideIcon;
  label: string;
  value: string;
  copyable?: boolean;
  linkable?: boolean;
}

export function InfoPearl({
  icon: Icon,
  label,
  value,
  copyable = false,
  linkable = false,
}: InfoPearlProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyable || !value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div
        className="px-4 py-3 rounded-[32px] glass-card-light hover:shadow-sage-glow transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Icon container */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(146, 175, 173, 0.15)",
              border: "1px solid rgba(146, 175, 173, 0.2)",
            }}
          >
            <Icon className="w-4 h-4 text-misty-sage" strokeWidth={1.5} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-charcoal/50 font-medium">{label}</p>
            <p className="text-sm text-charcoal font-medium truncate">{value || "—"}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {copyable && value && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="p-1.5 rounded-full hover:bg-misty-sage/10 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={1.5} />
                )}
              </motion.button>
            )}
            {linkable && value && (
              <motion.a
                href={value.startsWith("http") ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-full hover:bg-misty-sage/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={1.5} />
              </motion.a>
            )}
          </div>
        </div>
      </div>

      {/* Copy flash effect */}
      {copied && (
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)",
          }}
        />
      )}
    </motion.div>
  );
}

export default InfoPearl;

