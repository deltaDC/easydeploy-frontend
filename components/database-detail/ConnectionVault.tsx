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

      {/* Connection String */}
      <div
        className="relative p-4 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(30, 41, 59, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Copy flash effect */}
        <AnimatePresence>
          {copiedField === "connection" && (
            <motion.div
              initial={{ opacity: 0.8, x: "-100%" }}
              animate={{ opacity: 0, x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)",
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">Connection String</p>
            <code className="text-sm text-emerald-400 font-mono break-all">
              {showConnectionString ? connectionString : maskValue(connectionString)}
            </code>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConnectionString(!showConnectionString)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {showConnectionString ? (
                <EyeOff className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopy(connectionString, "connection")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {copiedField === "connection" ? (
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Individual fields */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-charcoal/50">{field.label}</p>
                <p className="text-sm font-mono text-charcoal truncate">
                  {field.sensitive && !showSensitive[field.label]
                    ? maskValue(field.value)
                    : field.value}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {field.sensitive && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSensitive(field.label)}
                    className="p-1.5 rounded-lg hover:bg-misty-sage/10 transition-colors"
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
                  className="p-1.5 rounded-lg hover:bg-misty-sage/10 transition-colors"
                >
                  {copiedField === field.label ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={1.5} />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Copy flash */}
            <AnimatePresence>
              {copiedField === field.label && (
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Warning */}
      {warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-xl"
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-amber-700">{warning}</p>
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

