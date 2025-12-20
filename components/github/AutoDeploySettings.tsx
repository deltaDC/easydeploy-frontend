"use client";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Zap } from "lucide-react";

interface AutoDeploySettingsProps {
  autoRedeploy: boolean;
  onAutoRedeployChange: (value: boolean) => void;
  usePublicUrl: boolean;
  embedded?: boolean;
}

export default function AutoDeploySettings({ 
  autoRedeploy, 
  onAutoRedeployChange, 
  usePublicUrl,
  embedded = false,
}: AutoDeploySettingsProps) {
  const content = (
    <>
      {/* Auto Deploy Toggle - Only show for Provider repos */}
      {!usePublicUrl && (
        <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRedeploy" className="text-sm font-medium text-charcoal">Tự động triển khai</Label>
                <p className="text-xs text-charcoal/60">
                  Tự động deploy khi code hoặc cấu hình thay đổi
                </p>
              </div>
              <motion.button
                onClick={() => onAutoRedeployChange(!autoRedeploy)}
                className={`
                  relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-misty-sage/30 focus:ring-offset-2
                  ${autoRedeploy ? 'bg-emerald-500' : 'bg-charcoal/20'}
                `}
                role="switch"
                aria-checked={autoRedeploy}
                whileTap={{ scale: 0.95 }}
              >
                {/* Emerald glow animation when on */}
                {autoRedeploy && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}
                <motion.span
                  className={`
                    pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                    ${autoRedeploy ? 'translate-x-7' : 'translate-x-0'}
                  `}
                  animate={{
                    scale: autoRedeploy ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                />
                {/* Light bar effect when on */}
                {autoRedeploy && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-400/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
        </div>
      )}

      {/* Warning for Public URL */}
      {usePublicUrl && (
        <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/50">
          <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-charcoal">
              ⚠️ Hạn chế với Public Repository
            </p>
            <p className="text-sm text-charcoal/70">
              Auto-deploy không được hỗ trợ cho public repositories. Bạn cần deploy thủ công khi có thay đổi.
            </p>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-inner-glow-soft overflow-hidden relative z-30">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-charcoal">Tự động triển khai</h3>
        </div>
        <p className="text-sm text-charcoal/70 mb-6">
          Cấu hình hành vi deploy tự động
        </p>
        {content}
      </div>
    </div>
  );
}
