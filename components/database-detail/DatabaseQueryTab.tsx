"use client";

import { motion } from "framer-motion";
import { Database, DatabaseStatus, DatabaseType } from "@/types/database.type";
import { SQLQueryEditor } from "@/components/database-monitoring/SQLQueryEditor";
import { TableBrowser } from "@/components/database-monitoring/TableBrowser";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database as DatabaseIcon } from "lucide-react";

interface DatabaseQueryTabProps {
  database: Database;
}

export function DatabaseQueryTab({ database }: DatabaseQueryTabProps) {
  const isDisabled = ["deploying", "pending", "stopped"].includes(
    database.status.toLowerCase()
  );

  if (isDisabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardContent className="py-16">
            <div className="text-center">
              <motion.div
                className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <DatabaseIcon className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-xl font-serif font-semibold text-charcoal mb-2">
                {database.status === DatabaseStatus.STOPPED
                  ? "Database đã dừng"
                  : "Database đang được triển khai"}
              </h3>
              <p className="text-sm text-charcoal/60 mb-4 max-w-md mx-auto">
                {database.status === DatabaseStatus.STOPPED
                  ? "Vui lòng khởi động database để sử dụng Query Editor."
                  : "Query Editor sẽ khả dụng sau khi database được khởi động."}
              </p>
              <Badge
                className="px-4 py-1.5"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#3B82F6",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                {database.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* SQL Editor with Dark Glass Mode - opacity 90%, see mist behind */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: "rgba(15, 23, 42, 0.9)", // Dark with 90% opacity
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <SQLQueryEditor databaseId={database.id} databaseType={database.type} />
      </div>

      {/* Table Browser - only for SQL databases */}
      {database.type !== DatabaseType.MONGODB && database.type !== DatabaseType.REDIS && (
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(25px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <TableBrowser databaseId={database.id} />
        </div>
      )}
    </motion.div>
  );
}

export default DatabaseQueryTab;

