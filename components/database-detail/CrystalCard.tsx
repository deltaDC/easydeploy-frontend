"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Database, DatabaseType } from "@/types/database.type";
import { DatabaseTypeIcon } from "./DatabaseTypeIcon";
import { StatusRipple } from "./StatusRipple";
import { DB_TYPE_COLORS } from "./types";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";

interface CrystalCardProps {
  database: Database;
  index?: number;
}

export function CrystalCard({ database, index = 0 }: CrystalCardProps) {
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

  return (
    <Link href={`/databases/${database.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative group cursor-pointer overflow-hidden rounded-3xl"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 10px 30px -5px rgba(146, 175, 173, 0.25)",
        }}
      >
        {/* Gradient border effect */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)`,
            padding: "1px",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* 3D Crystal Sphere */}
        <motion.div
          className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${colors.primary}40)`,
            boxShadow: `0 0 40px ${colors.glow}, inset 0 0 20px rgba(255,255,255,0.3)`,
            filter: "blur(1px)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <DatabaseTypeIcon type={database.type} size="sm" showGlow={true} />
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <DatabaseTypeIcon type={database.type} size="md" showGlow={false} />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-charcoal group-hover:text-charcoal/90 transition-colors truncate">
                  {database.name}
                </h3>
                <p className="text-sm text-charcoal/50">
                  {getTypeLabel(database.type)} {database.version}
                </p>
              </div>
            </div>
            <StatusRipple status={database.status} size="sm" showLabel={false} />
          </div>

          {/* Info row */}
          <div className="flex items-center justify-between text-xs text-charcoal/50">
            <span>Port: {database.port || "—"}</span>
            <span>{formatDateDDMMYYYYHHMMSS(database.createdAt)}</span>
          </div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `0 0 50px ${colors.glow}, inset 0 0 30px ${colors.glow}40`,
          }}
        />
      </motion.div>
    </Link>
  );
}

export default CrystalCard;

