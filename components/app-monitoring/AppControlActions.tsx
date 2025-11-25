"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Settings2, Loader2 } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AppControlActionsProps {
  appId: string;
  containerStatus?: string;
  onActionComplete?: () => void;
}

export function AppControlActions({ appId, containerStatus, onActionComplete }: AppControlActionsProps) {
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
          result = await AppMonitoringService.startApp(appId);
          break;
        case "stop":
          result = await AppMonitoringService.stopApp(appId);
          break;
        case "restart":
          result = await AppMonitoringService.restartApp(appId);
          break;
      }

      toast({
        title: "Success",
        description: result || `${actionName} completed successfully`,
      });

      if (onActionComplete) {
        onActionComplete();
      }
      
      // Refresh page to update container status
      router.refresh();
      
      // Wait a bit then reload to ensure backend has updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || `Failed to ${action} container`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  // Docker container statuses: running, exited, restarting, paused, etc.
  const statusLower = containerStatus?.toLowerCase() || "";
  const isRunning = statusLower.includes("running") || statusLower.includes("up");
  const isStopped = statusLower.includes("exited") || statusLower.includes("stopped") || statusLower.includes("created");
  const isDeploying = statusLower.includes("deploying") || statusLower.includes("in_progress") || statusLower.includes("pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Container Controls
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2">
          {containerStatus && (
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
                {isRunning ? 'Container đang chạy' : 
                 isStopped ? 'Container đã dừng' : 
                 isDeploying ? 'Đang triển khai...' :
                 `${containerStatus}`}
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full justify-start"
          variant={isRunning ? "outline" : "default"}
          disabled={isLoading || isRunning || isDeploying}
          onClick={() => handleAction("start", "Start")}
        >
          {isLoading && currentAction === "start" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Start Container
          {isRunning && <span className="ml-auto text-xs opacity-50">(Running)</span>}
          {isDeploying && <span className="ml-auto text-xs opacity-50">(Deploying)</span>}
        </Button>

        <Button
          className="w-full justify-start"
          variant={isStopped ? "outline" : "destructive"}
          disabled={isLoading || isStopped || isDeploying}
          onClick={() => handleAction("stop", "Stop")}
        >
          {isLoading && currentAction === "stop" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Square className="h-4 w-4 mr-2" />
          )}
          Stop Container
          {isStopped && <span className="ml-auto text-xs opacity-50">(Stopped)</span>}
          {isDeploying && <span className="ml-auto text-xs opacity-50">(Deploying)</span>}
        </Button>

        <Button
          className="w-full justify-start"
          variant="outline"
          disabled={isLoading || isStopped || isDeploying}
          onClick={() => handleAction("restart", "Restart")}
        >
          {isLoading && currentAction === "restart" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Restart Container
          {isDeploying && <span className="ml-auto text-xs opacity-50">(Deploying)</span>}
        </Button>
      </CardContent>
    </Card>
  );
}
