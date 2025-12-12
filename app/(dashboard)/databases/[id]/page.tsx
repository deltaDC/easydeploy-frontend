"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, DatabaseStatus } from "@/types/database.type";
import DatabaseService from "@/services/database.service";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { ArrowLeft, Play, Square, RotateCw, Trash2, Database as DatabaseIcon, Activity, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorDialog from "@/components/database/ErrorDialog";
import ConnectionInfoDialog from "@/components/database/ConnectionInfoDialog";
import DeleteConfirmDialog from "@/components/database/DeleteConfirmDialog";
import { DatabaseMetricsChart } from "@/components/database-monitoring/DatabaseMetricsChart";
import { DatabaseLogsViewer } from "@/components/database-monitoring/DatabaseLogsViewer";
import { SQLQueryEditor } from "@/components/database-monitoring/SQLQueryEditor";
import { TableBrowser } from "@/components/database-monitoring/TableBrowser";

export default function DatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [database, setDatabase] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [connectionInfoDialog, setConnectionInfoDialog] = useState<{
    open: boolean;
    connectionString: string;
    completeConnectionString?: string;
    username: string;
    password: string;
  }>({
    open: false,
    connectionString: "",
    completeConnectionString: undefined,
    username: "",
    password: "",
  });
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDatabase(true);
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDatabase = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const data = await DatabaseService.getDatabase(id);
      setDatabase(data);
      return data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await DatabaseService.getLogs(id, 100);
      setLogs(data);
    } catch (error) {
    }
  };

  const handleStart = async () => {
    try {
      await DatabaseService.startDatabase(id);
      setTimeout(async () => {
        const updatedData = await fetchDatabase(false);
        if (updatedData && updatedData.status !== "RUNNING") {
          let attempts = 0;
          const pollStatus = setInterval(async () => {
            attempts++;
            const data = await fetchDatabase(false);
            if (data && (data.status === "RUNNING" || attempts >= 3)) {
              clearInterval(pollStatus);
            }
          }, 1500);
        }
      }, 1000);
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể khởi động cơ sở dữ liệu",
      });
    }
  };

  const handleStop = async () => {
    try {
      await DatabaseService.stopDatabase(id);
      setTimeout(async () => {
        const updatedData = await fetchDatabase(false);
        if (updatedData && updatedData.status !== "STOPPED") {
          let attempts = 0;
          const pollStatus = setInterval(async () => {
            attempts++;
            const data = await fetchDatabase(false);
            if (data && (data.status === "STOPPED" || attempts >= 3)) {
              clearInterval(pollStatus);
            }
          }, 1500);
        }
      }, 1000);
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể dừng cơ sở dữ liệu",
      });
    }
  };

  const handleRestart = async () => {
    try {
      await DatabaseService.restartDatabase(id);
      setTimeout(async () => {
        const updatedData = await fetchDatabase(false);
        if (updatedData && updatedData.status !== "RUNNING") {
          let attempts = 0;
          const pollStatus = setInterval(async () => {
            attempts++;
            const data = await fetchDatabase(false);
            if (data && (data.status === "RUNNING" || attempts >= 4)) {
              clearInterval(pollStatus);
            }
          }, 2000);
        }
      }, 1500);
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể khởi động lại cơ sở dữ liệu",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await DatabaseService.deleteDatabase(id);
      router.push("/databases");
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể xóa cơ sở dữ liệu",
      });
    }
  };

  const handleViewConnectionInfo = async () => {
    try {
      const info = await DatabaseService.getConnectionInfo(id);
      setConnectionInfoDialog({
        open: true,
        connectionString: info.connectionString,
        completeConnectionString: info.completeConnectionString,
        username: info.username,
        password: info.password,
      });
    } catch (error: any) {
      setErrorDialog({
        open: true,
        message: error.message || "Không thể lấy thông tin kết nối",
      });
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

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!database) {
    return <div>Không tìm thấy cơ sở dữ liệu</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/databases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{database.name}</h1>
            <p className="text-muted-foreground">
              {database.type} {database.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(database.status)}
          {database.status === DatabaseStatus.RUNNING && (
            <Button variant="outline" size="sm" onClick={handleStop}>
              <Square className="mr-2 h-4 w-4" />
              Dừng
            </Button>
          )}
          {database.status === DatabaseStatus.STOPPED && (
            <Button variant="outline" size="sm" onClick={handleStart}>
              <Play className="mr-2 h-4 w-4" />
              Khởi động
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <RotateCw className="mr-2 h-4 w-4" />
            Khởi động lại
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          {/* Show Query/Data tab for all database types */}
          <TabsTrigger value="query">
            <DatabaseIcon className="h-4 w-4 mr-2" />
            {database.type === "MONGODB" ? "Data" : database.type === "REDIS" ? "Keys" : "Query"}
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Activity className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Terminal className="h-4 w-4 mr-2" />
            Nhật ký
          </TabsTrigger>
          <TabsTrigger value="connection">Kết nối</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Cơ sở dữ liệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại:</span>
                  <span>{database.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phiên bản:</span>
                  <span>{database.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Máy chủ:</span>
                  <span>{database.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cổng:</span>
                  <span>{database.port}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên Cơ sở dữ liệu:</span>
                  <span>{database.databaseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dung lượng lưu trữ:</span>
                  <span>{database.storageGb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạo lúc:</span>
                  <span>{formatDateDDMMYYYYHHMMSS(database.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          {database && ["deploying", "pending", "stopped"].includes(database.status.toLowerCase()) ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <DatabaseIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {database.status === DatabaseStatus.STOPPED ? "Database đã dừng" : "Database đang được triển khai"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {database.status === DatabaseStatus.STOPPED 
                      ? "Vui lòng khởi động database để sử dụng Query Editor."
                      : "Query Editor sẽ khả dụng sau khi database được khởi động."}
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    {database.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <SQLQueryEditor databaseId={id} databaseType={database.type} />
              {/* Only show TableBrowser for SQL databases */}
              {database.type !== "MONGODB" && database.type !== "REDIS" && (
                <TableBrowser databaseId={id} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {database && ["deploying", "pending"].includes(database.status.toLowerCase()) ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Database đang được triển khai</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dữ liệu metrics sẽ khả dụng sau khi quá trình triển khai hoàn tất.
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    {database.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DatabaseMetricsChart databaseId={id} />
          )}
        </TabsContent>

        <TabsContent value="logs">
          {database && ["deploying", "pending"].includes(database.status.toLowerCase()) ? (
            <Card>
              <CardHeader>
                <CardTitle>Nhật ký</CardTitle>
                <CardDescription>Nhật ký container</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Database đang được triển khai</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Logs sẽ khả dụng sau khi database được khởi động.
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">
                    {database.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DatabaseLogsViewer databaseId={id} maxLines={500} />
          )}
        </TabsContent>

        <TabsContent value="logs-old">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký (Legacy)</CardTitle>
              <CardDescription>Nhật ký container - Phiên bản cũ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => <div key={index}>{log}</div>)
                ) : (
                  <div className="text-muted-foreground">Không có nhật ký</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Kết nối</CardTitle>
              <CardDescription>Sử dụng các thông tin đăng nhập này để kết nối đến cơ sở dữ liệu của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Chuỗi kết nối</Label>
                  <Input
                    value={`${database.host}:${database.port}/${database.databaseName}`}
                    readOnly
                    className="mt-1 font-mono"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Nhấp &quot;Xem Thông tin Kết nối&quot; để xem đầy đủ thông tin kết nối cùng thông tin đăng nhập
                </div>
                <Button onClick={handleViewConnectionInfo}>
                  Xem Thông tin Kết nối
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        message={errorDialog.message}
      />

      <ConnectionInfoDialog
        open={connectionInfoDialog.open}
        onOpenChange={(open) => setConnectionInfoDialog({ ...connectionInfoDialog, open })}
        connectionString={connectionInfoDialog.connectionString}
        username={connectionInfoDialog.username}
        password={connectionInfoDialog.password}
      />

      <DeleteConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDelete}
        itemName={database?.name}
        message="Bạn có chắc chắn muốn xóa cơ sở dữ liệu này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}

