"use client";

import { motion } from "framer-motion";
import { Database, DatabaseStatus } from "@/types/database.type";
import { DatabaseLogsViewer } from "@/components/database-monitoring/DatabaseLogsViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";

interface DatabaseLogsTabProps {
  database: Database;
}

export function DatabaseLogsTab({ database }: DatabaseLogsTabProps) {
  const isDisabled = ["deploying", "pending"].includes(database.status.toLowerCase());

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
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Terminal className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-xl font-serif font-semibold text-charcoal mb-2">
                Database đang được triển khai
              </h3>
              <p className="text-sm text-charcoal/60 mb-4 max-w-md mx-auto">
                Logs sẽ khả dụng sau khi database được khởi động.
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
    >
      {/* Glass Terminal Container */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <DatabaseLogsViewer databaseId={database.id} maxLines={500} />
      </div>
    </motion.div>
  );
}

export default DatabaseLogsTab;

