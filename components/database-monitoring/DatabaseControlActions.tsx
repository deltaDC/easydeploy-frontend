"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Settings2, Loader2 } from "lucide-react";
import DatabaseMonitoringService from "@/services/database-monitoring.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface DatabaseControlActionsProps {
  databaseId: string;
  status?: string;
  onActionComplete?: () => void;
}

export function DatabaseControlActions({ databaseId, status, onActionComplete }: DatabaseControlActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAction = async (action: "start" | "stop" | "restart", actionName: string) => {
    setIsLoading(true);
    setCurrentAction(action);

    try {
      let result: string;
      switch (action) {
        case "start":
          result = await DatabaseMonitoringService.startDatabase(databaseId);
          break;
        case "stop":
          result = await DatabaseMonitoringService.stopDatabase(databaseId);
          break;
        case "restart":
          result = await DatabaseMonitoringService.restartDatabase(databaseId);
          break;
      }

      toast({
        title: "Thành công",
        description: result || `${actionName} hoàn tất thành công`,
      });

      if (onActionComplete) {
        onActionComplete();
      }
      
      router.refresh();
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data || `Không thể ${action === "start" ? "khởi động" : action === "stop" ? "dừng" : "khởi động lại"} cơ sở dữ liệu`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const statusLower = status?.toLowerCase() || "";
  const isRunning = statusLower.includes("running") || statusLower.includes("up");
  const isStopped = statusLower.includes("stopped") || statusLower.includes("exited") || statusLower.includes("created");
  const isDeploying = statusLower.includes("deploying") || statusLower.includes("pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Điều khiển cơ sở dữ liệu
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2">
          {status && (
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                isRunning ? 'bg-green-500 animate-pulse' : 
                isStopped ? 'bg-red-500' : 
                isDeploying ? 'bg-blue-500 animate-pulse' : 
                'bg-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                isRunning ? 'text-green-600 dark:text-green-400' : 
                isStopped ? 'text-red-600 dark:text-red-400' : 
                isDeploying ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-600'
              }`}>
                {isRunning ? 'Cơ sở dữ liệu đang chạy' : 
                 isStopped ? 'Cơ sở dữ liệu đã dừng' : 
                 isDeploying ? 'Đang triển khai...' :
                 `${status}`}
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full justify-start"
          variant={isRunning ? "secondary" : "success"}
          disabled={isLoading || isRunning || isDeploying}
          onClick={() => handleAction("start", "Khởi động")}
        >
          {isLoading && currentAction === "start" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Khởi động cơ sở dữ liệu
          {isRunning && <span className="ml-auto text-xs opacity-50">(Đang chạy)</span>}
          {isDeploying && <span className="ml-auto text-xs opacity-50">(Đang triển khai)</span>}
        </Button>

        <Button
          className="w-full justify-start"
          variant={isStopped ? "secondary" : "destructive"}
          disabled={isLoading || isStopped || isDeploying}
          onClick={() => handleAction("stop", "Dừng")}
        >
          {isLoading && currentAction === "stop" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Square className="h-4 w-4 mr-2" />
          )}
          Dừng cơ sở dữ liệu
          {isStopped && <span className="ml-auto text-xs opacity-50">(Đã dừng)</span>}
          {isDeploying && <span className="ml-auto text-xs opacity-50">(Đang triển khai)</span>}
        </Button>

        <Button
          className="w-full justify-start"
          variant="warning"
          disabled={isLoading || isStopped || isDeploying}
          onClick={() => handleAction("restart", "Khởi động lại")}
        >
          {isLoading && currentAction === "restart" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Khởi động lại cơ sở dữ liệu
          {isDeploying && <span className="ml-auto text-xs opacity-50">(Đang triển khai)</span>}
        </Button>
      </CardContent>
    </Card>
  );
}
