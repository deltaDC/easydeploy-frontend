"use client";
import { motion } from "framer-motion";
import { Github, Link as LinkIcon } from "lucide-react";

interface DeployMethodSelectorProps {
  usePublicUrl: boolean;
  onToggle: (usePublic: boolean) => void;
}

export default function DeployMethodSelector({ usePublicUrl, onToggle }: DeployMethodSelectorProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-inner-glow-soft">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">Chọn phương thức deploy</h3>
          <p className="text-sm text-charcoal/80">
            Chọn repository từ GitHub provider hoặc nhập URL public repository
          </p>
        </div>
        
        {/* Pill Tabs */}
        <div className="inline-flex rounded-full bg-white/80 backdrop-blur-sm p-1.5 border-2 border-charcoal/20 shadow-inner-sm">
          <motion.button
            onClick={() => onToggle(false)}
            className={`
              relative flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${!usePublicUrl 
                ? 'text-charcoal' 
                : 'text-charcoal/60 hover:text-charcoal'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!usePublicUrl && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-emerald-200/20 rounded-full shadow-emerald-md"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            {/* GitHub Logo 3D */}
            <div className={`relative z-10 flex items-center gap-2.5 ${!usePublicUrl ? 'drop-shadow-md' : ''}`}>
              <div className={`relative ${!usePublicUrl ? 'transform transition-transform hover:scale-110' : ''}`}>
                <Github className={`h-5 w-5 ${!usePublicUrl ? 'text-charcoal' : 'text-charcoal/60'}`} strokeWidth={1.5} />
                {!usePublicUrl && (
                  <div className="absolute inset-0 bg-emerald-400/20 blur-sm -z-10" />
                )}
              </div>
              <span className={`relative z-10 ${!usePublicUrl ? 'text-charcoal' : 'text-charcoal/60'}`}>Repository riêng tư</span>
            </div>
          </motion.button>
          
          <motion.button
            onClick={() => onToggle(true)}
            className={`
              relative flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${usePublicUrl 
                ? 'text-charcoal' 
                : 'text-charcoal/60 hover:text-charcoal'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {usePublicUrl && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-emerald-200/20 rounded-full shadow-emerald-md"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-2.5">
              <LinkIcon className={`h-5 w-5 ${usePublicUrl ? 'text-charcoal' : 'text-charcoal/60'}`} strokeWidth={1.5} />
              <span className={usePublicUrl ? 'text-charcoal' : 'text-charcoal/60'}>Repository công khai</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
