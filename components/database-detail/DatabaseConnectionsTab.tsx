"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Database } from "@/types/database.type";
import { ConnectionVault } from "./ConnectionVault";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DatabaseService from "@/services/database.service";
import { isDockerInternalHost, isLocalOrPrivateHost, getHostWarningMessage } from "@/utils/hostValidation";

interface DatabaseConnectionsTabProps {
  database: Database;
}

export function DatabaseConnectionsTab({ database }: DatabaseConnectionsTabProps) {
  const [connectionInfo, setConnectionInfo] = useState<{
    connectionString: string;
    externalHost: string;
    port: number;
    databaseName: string;
    username: string;
    password: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectionInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const info = await DatabaseService.getConnectionInfo(database.id);
        
        if (isDockerInternalHost(info.externalHost)) {
          setError("Server chưa được cấu hình public hostname/IP. Không thể kết nối từ máy của bạn.");
          return;
        }

        setConnectionInfo({
          connectionString: info.externalCompleteConnectionString || info.externalConnectionString || "",
          externalHost: info.externalHost || "",
          port: info.port,
          databaseName: info.databaseName,
          username: info.username,
          password: info.password,
        });
      } catch (err: any) {
        setError(err.message || "Không thể lấy thông tin kết nối");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnectionInfo();
  }, [database.id]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardContent className="py-16">
            <div className="flex items-center justify-center">
              <motion.div
                className="w-8 h-8 border-2 border-misty-sage border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !connectionInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-0 shadow-sage-glow">
          <CardContent className="py-8">
            <Alert variant="destructive" className="border-0 bg-rose-50/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Không thể lấy thông tin kết nối"}
                <br />
                <span className="text-xs mt-1 block opacity-70">
                  Vui lòng liên hệ admin để cấu hình public hostname/IP hoặc sử dụng kết nối nội bộ cho backend.
                </span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const warning = isLocalOrPrivateHost(connectionInfo.externalHost)
    ? (getHostWarningMessage(connectionInfo.externalHost) ?? undefined)
    : undefined;

  const fields = [
    { label: "Host", value: connectionInfo.externalHost },
    { label: "Port", value: String(connectionInfo.port) },
    { label: "Database", value: connectionInfo.databaseName },
    { label: "Username", value: connectionInfo.username },
    { label: "Password", value: connectionInfo.password, sensitive: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-0 shadow-sage-glow">
        <CardContent className="p-6">
          <ConnectionVault
            connectionString={connectionInfo.connectionString}
            fields={fields}
            warning={warning}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DatabaseConnectionsTab;

