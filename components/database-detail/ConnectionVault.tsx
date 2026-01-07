"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Copy, Check, Eye, EyeOff, Lock, Shield, AlertTriangle } from "lucide-react";

interface ConnectionField {
  label: string;
  value: string;
  sensitive?: boolean;
}

interface ConnectionVaultProps {
  connectionString: string;
  fields: ConnectionField[];
  warning?: string;
}

export function ConnectionVault({
  connectionString,
  fields,
  warning,
}: ConnectionVaultProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [showConnectionString, setShowConnectionString] = useState(false);

  const handleCopy = async (value: string, fieldLabel: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldLabel);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleSensitive = (fieldLabel: string) => {
    setShowSensitive((prev) => ({
      ...prev,
      [fieldLabel]: !prev[fieldLabel],
    }));
  };

  const maskValue = (value: string) => "•".repeat(Math.min(value.length, 20));

  return (
    <div className="space-y-4">
      {/* Vault header */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(146, 175, 173, 0.2), rgba(146, 175, 173, 0.1))",
            border: "1px solid rgba(146, 175, 173, 0.3)",
          }}
        >
          <Shield className="w-5 h-5 text-misty-sage" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-charcoal">Thông tin kết nối</h3>
          <p className="text-xs text-charcoal/50">Bảo mật - Không chia sẻ công khai</p>
        </div>
      </div>

      {/* Connection String - Thick glass block with bright border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative p-5 rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(30px)",
          border: "2px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 0 40px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Copy flash effect - Green mint border flash */}
        <AnimatePresence>
          {copiedField === "connection" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.8), inset 0 0 30px rgba(16, 185, 129, 0.3)",
                border: "2px solid rgba(16, 185, 129, 0.8)",
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-charcoal/50 mb-2">Connection String</p>
            {/* Blur text by default, reveal on show */}
            <div className="relative">
              <code 
                className={`text-sm font-mono break-all transition-all duration-500 ${
                  showConnectionString ? "text-charcoal filter-none" : "text-charcoal/30 filter blur-sm"
                }`}
              >
                {connectionString}
              </code>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {/* Eye switch button - Blur layer fades from left to right */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConnectionString(!showConnectionString)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              style={{
                background: showConnectionString ? "rgba(255, 255, 255, 0.2)" : "transparent",
              }}
            >
              {showConnectionString ? (
                <EyeOff className="w-4 h-4 text-charcoal/70" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4 text-charcoal/70" strokeWidth={1.5} />
              )}
            </motion.button>
            {/* Copy button - Turns into green checkmark, border flashes green mint */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(connectionString, "connection")}
              className="p-2 rounded-lg transition-all duration-300"
              style={{
                background: copiedField === "connection" 
                  ? "rgba(16, 185, 129, 0.2)" 
                  : "rgba(255, 255, 255, 0.1)",
                border: copiedField === "connection"
                  ? "1px solid rgba(16, 185, 129, 0.8)"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: copiedField === "connection"
                  ? "0 0 15px rgba(16, 185, 129, 0.5)"
                  : "none",
              }}
            >
              {copiedField === "connection" ? (
                <Check className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              ) : (
                <Copy className="w-4 h-4 text-charcoal/70" strokeWidth={1.5} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Individual fields - Grid 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((field, index) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative group"
          >
            {/* Small card for each field */}
            <div
              className="flex flex-col p-4 rounded-2xl transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">{field.label}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {field.sensitive && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSensitive(field.label)}
                      className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      {showSensitive[field.label] ? (
                        <EyeOff className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={1.5} />
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(field.value, field.label)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    style={{
                      background: copiedField === field.label ? "rgba(16, 185, 129, 0.2)" : "transparent",
                    }}
                  >
                    {copiedField === field.label ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={1.5} />
                    )}
                  </motion.button>
                </div>
              </div>
              <p className="text-sm font-mono text-charcoal break-all">
                {field.sensitive && !showSensitive[field.label]
                  ? maskValue(field.value)
                  : field.value}
              </p>
            </div>

            {/* Copy flash - Green mint border flash */}
            <AnimatePresence>
              {copiedField === field.label && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: "0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.8)",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Warning - 3D Shield icon in yellow */}
      {warning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
          }}
        >
          <motion.div
            animate={{
              rotateY: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <Shield className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} style={{ filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))" }} />
          </motion.div>
          <p className="text-sm text-amber-700 font-medium">{warning}</p>
        </motion.div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 pt-2">
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Lock className="w-3.5 h-3.5 text-misty-sage" strokeWidth={1.5} />
        </motion.div>
        <p className="text-xs text-charcoal/40">
          Không chia sẻ thông tin này với bất kỳ ai
        </p>
      </div>
    </div>
  );
}

export default ConnectionVault;

