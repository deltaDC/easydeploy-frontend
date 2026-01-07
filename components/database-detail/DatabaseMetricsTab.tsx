"use client";

import { motion } from "framer-motion";
import { Database, DatabaseStatus } from "@/types/database.type";
import { DatabaseMetricsChart } from "@/components/database-monitoring/DatabaseMetricsChart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface DatabaseMetricsTabProps {
  database: Database;
}

export function DatabaseMetricsTab({ database }: DatabaseMetricsTabProps) {
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
                <Activity className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Cơ sở dữ liệu đang được triển khai
              </h3>
              <p className="text-sm text-charcoal/60 mb-4 max-w-md mx-auto">
                Dữ liệu hiệu suất sẽ khả dụng sau khi quá trình triển khai hoàn tất.
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
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(25px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <DatabaseMetricsChart databaseId={database.id} />
      </div>
    </motion.div>
  );
}

export default DatabaseMetricsTab;

