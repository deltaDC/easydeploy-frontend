"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Terminal, FileText, History, Settings } from "lucide-react";
import { TabConfig } from "./types";

interface LockedTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabsLocked: boolean;
  showSuccessAnimation: boolean;
  onSuccessAnimationComplete?: () => void;
}

// Tab configurations
const TABS: TabConfig[] = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: Settings,
    lockedWhenDeploying: true,
  },
  {
    id: "metrics",
    label: "Hiệu suất",
    icon: Activity,
    lockedWhenDeploying: true,
  },
  {
    id: "logs",
    label: "Nhật ký Runtime",
    icon: Terminal,
    lockedWhenDeploying: true,
  },
  {
    id: "build-logs",
    label: "Nhật ký Build",
    icon: FileText,
    lockedWhenDeploying: false, // Always accessible
  },
  {
    id: "history",
    label: "Lịch sử",
    icon: History,
    lockedWhenDeploying: true,
  },
];

export function LockedTabBar({
  activeTab,
  onTabChange,
  tabsLocked,
  showSuccessAnimation,
  onSuccessAnimationComplete,
}: LockedTabBarProps) {
  // Track animation state - use showSuccessAnimation directly for unlocking
  const unlocking = showSuccessAnimation;

  // Handle animation completion callback
  useEffect(() => {
    if (showSuccessAnimation) {
      const timer = setTimeout(() => {
        onSuccessAnimationComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation, onSuccessAnimationComplete]);

  const handleTabChange = (tabId: string) => {
    const tab = TABS.find((t) => t.id === tabId);
    if (!tab) return;

    // If locked and this tab should be locked, don't allow change
    if (tabsLocked && tab.lockedWhenDeploying) {
      return;
    }

    onTabChange(tabId);
  };

  return (
    <div className="relative">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none z-10 rounded-xl"
            onAnimationComplete={onSuccessAnimationComplete}
          />
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass-card p-1.5 gap-1">
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isLocked = tabsLocked && tab.lockedWhenDeploying;
            const isActive = activeTab === tab.id;

            return (
              <motion.div
                key={tab.id}
                initial={false}
                animate={{
                  opacity: isLocked ? 0.3 : 1,
                  scale: unlocking && tab.lockedWhenDeploying ? [0.98, 1.02, 1] : 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: unlocking ? index * 0.1 : 0,
                }}
                className={isLocked ? "tab-locked" : unlocking && tab.lockedWhenDeploying ? "tab-unlocked" : ""}
              >
                <TabsTrigger
                  value={tab.id}
                  disabled={isLocked}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-300
                    ${isActive
                      ? "bg-white/80 text-charcoal shadow-sm"
                      : "text-charcoal/60 hover:text-charcoal hover:bg-white/40"
                    }
                    ${isLocked
                      ? "cursor-not-allowed opacity-30 grayscale-[50%]"
                      : "cursor-pointer"
                    }
                    haptic-button
                  `}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              </motion.div>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Locked Indicator */}
      <AnimatePresence>
        {tabsLocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-0 right-0 flex justify-center"
          >
            <span className="text-xs text-amber-600/80 bg-amber-50/80 px-3 py-1 rounded-full backdrop-blur-sm">
              Các tab khác sẽ mở khóa sau khi triển khai hoàn tất
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

