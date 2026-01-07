"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Square, RotateCw, Trash2 } from "lucide-react";
import { Database, DatabaseStatus, DatabaseType } from "@/types/database.type";
import { DatabaseTypeIcon } from "./DatabaseTypeIcon";
import { StatusPulse } from "./StatusPulse";
import { Button } from "@/components/ui/button";

interface MistyDatabaseHeaderProps {
  database: Database;
  isDeleting?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onDelete?: () => void;
}

export function MistyDatabaseHeader({
  database,
  isDeleting = false,
  onStart,
  onStop,
  onRestart,
  onDelete,
}: MistyDatabaseHeaderProps) {
  const router = useRouter();

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(25px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between">
          {/* Left side - Back button and info */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/databases")}
              className="p-2 rounded-xl glass-card-light haptic-button"
            >
              <ArrowLeft className="w-5 h-5 text-charcoal/70" strokeWidth={1.5} />
            </motion.button>

            <DatabaseTypeIcon type={database.type} size="lg" />

            <div>
              <h1 className="text-2xl font-bold text-charcoal">
                {database.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-charcoal/60">
                  {getTypeLabel(database.type)} {database.version}
                </span>
                <StatusPulse status={database.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Right side - Control buttons */}
          <div className="flex items-center gap-2">
            {database.status === DatabaseStatus.STOPPED && onStart && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStart}
                  className="glass-card-light haptic-button border-0"
                >
                  <Play className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Khởi động
                </Button>
              </motion.div>
            )}

            {database.status === DatabaseStatus.RUNNING && onStop && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStop}
                  className="glass-card-light haptic-button border-0 stop-button-reveal"
                >
                  <Square className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Dừng
                </Button>
              </motion.div>
            )}

            {onRestart && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRestart}
                  className="glass-card-light haptic-button border-0"
                >
                  <RotateCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Khởi động lại
                </Button>
              </motion.div>
            )}

            {onDelete && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="glass-card-light haptic-button border-0 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MistyDatabaseHeader;

