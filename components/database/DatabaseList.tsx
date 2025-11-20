"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, DatabaseStatus, DatabaseType } from "@/types/database.type";
import DatabaseService from "@/services/database.service";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import Link from "next/link";
import { Plus, Database as DatabaseIcon } from "lucide-react";

export default function DatabaseList() {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setIsLoading(true);
      const data = await DatabaseService.getDatabases();
      setDatabases(data);
    } catch (error) {
      // Silently handle error
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: DatabaseStatus) => {
    const variants: Record<DatabaseStatus, "default" | "secondary" | "destructive" | "outline"> = {
      [DatabaseStatus.RUNNING]: "default",
      [DatabaseStatus.PENDING]: "secondary",
      [DatabaseStatus.DEPLOYING]: "secondary",
      [DatabaseStatus.FAILED]: "destructive",
      [DatabaseStatus.STOPPED]: "outline",
      [DatabaseStatus.DELETING]: "secondary",
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeLabel = (type: DatabaseType) => {
    const labels: Record<DatabaseType, string> = {
      [DatabaseType.POSTGRESQL]: "PostgreSQL",
      [DatabaseType.MYSQL]: "MySQL",
      [DatabaseType.MONGODB]: "MongoDB",
      [DatabaseType.REDIS]: "Redis",
    };
    return labels[type];
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cơ sở dữ liệu</h2>
        <Link href="/databases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Triển khai Cơ sở dữ liệu
          </Button>
        </Link>
      </div>

      {databases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Không tìm thấy cơ sở dữ liệu nào</p>
            <Link href="/databases/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Triển khai Cơ sở dữ liệu đầu tiên
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {databases.map((database) => (
            <Link key={database.id} href={`/databases/${database.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{database.name}</CardTitle>
                    {getStatusBadge(database.status)}
                  </div>
                  <CardDescription>
                    {getTypeLabel(database.type)} {database.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cổng:</span>
                      <span>{database.port}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tạo lúc: {formatDateDDMMYYYYHHMMSS(database.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

