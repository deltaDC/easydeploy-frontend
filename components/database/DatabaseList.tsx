"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Database as DatabaseIcon, Filter } from "lucide-react";
import { Database, DatabaseType } from "@/types/database.type";
import DatabaseService from "@/services/database.service";
import { Button } from "@/components/ui/button";
import {
  DatabaseGlassCard,
  CrystalCard,
  MistyBackground,
  StatusRipple,
  DatabaseTypeIcon,
  DB_TYPE_COLORS,
} from "@/components/database-detail";

// Filter pill component
function FilterPill({
  type,
  label,
  isActive,
  onClick,
}: {
  type: DatabaseType | "all";
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const colors = type === "all" ? null : DB_TYPE_COLORS[type];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${isActive ? "shadow-lg" : ""}
      `}
      style={{
        background: isActive
          ? colors
            ? `linear-gradient(135deg, ${colors.bg}, rgba(255,255,255,0.6))`
            : "rgba(146, 175, 173, 0.2)"
          : "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(10px)",
        border: isActive
          ? colors
            ? `2px solid ${colors.border}`
            : "2px solid rgba(146, 175, 173, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.3)",
        color: isActive ? (colors ? colors.text : "#4A6163") : "#64748B",
        boxShadow: isActive
          ? colors
            ? `0 0 20px ${colors.glow}`
            : "0 0 15px rgba(146, 175, 173, 0.3)"
          : "none",
      }}
    >
      <span className="flex items-center gap-2">
        {type !== "all" && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors?.primary }}
          />
        )}
        {label}
      </span>
    </motion.button>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl py-20 px-8"
      style={{
        background: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Mist background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full blur-3xl"
            style={{
              background: "rgba(146, 175, 173, 0.15)",
              left: `${10 + i * 25}%`,
              top: `${20 + (i % 2) * 30}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Crystal illustration */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative mb-8"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Crystal shape */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 20px 40px rgba(146, 175, 173, 0.2)",
            }}
          >
            <DatabaseIcon className="w-10 h-10 text-misty-sage" strokeWidth={1.5} />
          </div>

          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              boxShadow: "0 0 40px rgba(146, 175, 173, 0.4)",
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <h3 className="text-2xl font-serif font-semibold text-charcoal mb-3">
          Chưa có cơ sở dữ liệu nào
        </h3>
        <p className="text-charcoal/60 mb-8 text-center max-w-md">
          Triển khai cơ sở dữ liệu đầu tiên của bạn để bắt đầu lưu trữ và quản lý dữ liệu
        </p>

        <Link href="/databases/new">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className="px-8 py-6 text-base font-semibold rounded-2xl transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                boxShadow: "0 10px 30px rgba(34, 197, 94, 0.4)",
              }}
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Triển khai Cơ sở dữ liệu đầu tiên
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-48 rounded-2xl glass-shimmer"
          style={{
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(20px)",
          }}
        />
      ))}
    </div>
  );
}

export default function DatabaseList() {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<DatabaseType | "all">("all");

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setIsLoading(true);
      const data = await DatabaseService.getDatabases();
      setDatabases(data);
    } catch (error) {
      console.error("Error fetching databases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDatabases =
    filter === "all"
      ? databases
      : databases.filter((db) => db.type === filter);

  const filterOptions = [
    { type: "all" as const, label: "Tất cả" },
    { type: DatabaseType.POSTGRESQL, label: "PostgreSQL" },
    { type: DatabaseType.MONGODB, label: "MongoDB" },
    { type: DatabaseType.MYSQL, label: "MySQL" },
    { type: DatabaseType.REDIS, label: "Redis" },
  ];

  return (
    <MistyBackground>
      <div className="space-y-6">
      {/* Header with filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal/40 mr-1" strokeWidth={1.5} />
          {filterOptions.map((option) => (
            <FilterPill
              key={option.type}
              type={option.type}
              label={option.label}
              isActive={filter === option.type}
              onClick={() => setFilter(option.type)}
            />
          ))}
        </div>

        {/* Deploy button */}
        <Link href="/databases/new">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="gap-2 rounded-xl px-6 text-white"
              style={{
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Triển khai Cơ sở dữ liệu
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : databases.length === 0 ? (
        <EmptyState />
      ) : filteredDatabases.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-charcoal/60">
            Không tìm thấy database nào với bộ lọc này
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredDatabases.map((database, index) => (
              <CrystalCard
                key={database.id}
                database={database}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      </div>
    </MistyBackground>
  );
}
