"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Database, DatabaseStatus, DatabaseType } from "@/types/database.type";
import { DatabaseTypeIcon } from "./DatabaseTypeIcon";
import { StatusPulse } from "./StatusPulse";
import { LiquidStorageBar } from "./LiquidStorageBar";
import { DB_TYPE_COLORS } from "./types";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";

interface DatabaseGlassCardProps {
  database: Database;
  index?: number;
}

export function DatabaseGlassCard({ database, index = 0 }: DatabaseGlassCardProps) {
  const colors = DB_TYPE_COLORS[database.type];

  const getTypeLabel = (type: DatabaseType) => {
    const labels: Record<DatabaseType, string> = {
      [DatabaseType.POSTGRESQL]: "PostgreSQL",
      [DatabaseType.MYSQL]: "MySQL",
      [DatabaseType.MONGODB]: "MongoDB",
      [DatabaseType.REDIS]: "Redis",
    };
    return labels[type];
  };

  // Simulate storage usage (in real app, this would come from backend)
  const storageUsed = (database.storageGb || 1) * 0.3; // 30% used for demo
  const storageTotal = database.storageGb || 1;

  return (
    <Link href={`/databases/${database.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="relative group cursor-pointer overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Animated glow spot based on DB type */}
        <motion.div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ backgroundColor: colors.glow }}
          animate={{
            x: [0, 15, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <DatabaseTypeIcon type={database.type} size="md" showGlow={false} />
              <div>
                <h3 className="text-lg font-semibold text-charcoal group-hover:text-charcoal/90 transition-colors">
                  {database.name}
                </h3>
                <p className="text-sm text-charcoal/50">
                  {getTypeLabel(database.type)} {database.version}
                </p>
              </div>
            </div>
            <StatusPulse status={database.status} size="sm" showLabel={false} />
          </div>

          {/* Storage bar */}
          <div className="mb-4">
            <LiquidStorageBar
              used={storageUsed}
              total={storageTotal}
              height={6}
            />
          </div>

          {/* Info row */}
          <div className="flex items-center justify-between text-xs text-charcoal/50">
            <span>Port: {database.port || "—"}</span>
            <span>{formatDateDDMMYYYYHHMMSS(database.createdAt)}</span>
          </div>
        </div>

        {/* Hover border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `inset 0 0 0 1px ${colors.border}, 0 0 30px ${colors.glow}`,
          }}
        />
      </motion.div>
    </Link>
  );
}

export default DatabaseGlassCard;

