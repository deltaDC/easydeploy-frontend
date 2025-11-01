"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContainerDetail } from "@/types/monitoring.type";
import { Server, PlayCircle, StopCircle, RefreshCw, Cpu, HardDrive, Clock, Calendar, Image, Network, Settings } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContainerDetailDialogProps {
  open: boolean;
  onClose: () => void;
  container: ContainerDetail | null;
  onRestart: (containerId: string, reason: string) => void;
  onStop: (containerId: string, reason: string) => void;
  onStart: (containerId: string, reason: string) => void;
  isLoading?: boolean;
}

export default function ContainerDetailDialog({
  open,
  onClose,
  container,
  onRestart,
  onStop,
  onStart,
  isLoading = false
}: ContainerDetailDialogProps) {
  const [actionReason, setActionReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<'restart' | 'stop' | 'start' | null>(null);

  if (!container) return null;

  const handleAction = (action: 'restart' | 'stop' | 'start') => {
    setPendingAction(action);
    setShowReasonInput(true);
  };

  const executeAction = () => {
    if (!pendingAction || !actionReason.trim()) return;

    switch (pendingAction) {
      case 'restart':
        onRestart(container.containerId, actionReason);
        break;
      case 'stop':
        onStop(container.containerId, actionReason);
        break;
      case 'start':
        onStart(container.containerId, actionReason);
        break;
    }

    setActionReason("");
    setShowReasonInput(false);
    setPendingAction(null);
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {container.appName || container.containerName}
          </DialogTitle>
          <DialogDescription>
            Container ID: {container.containerId.substring(0, 12)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 pr-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={container.status === 'running' ? 'default' : 'secondary'} className="capitalize">
                  {container.status}
                </Badge>
              </div>
              
              {!showReasonInput && (
                <div className="flex gap-2">
                  {container.status === 'running' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('restart')}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Restart
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction('stop')}
                        disabled={isLoading}
                      >
                        <StopCircle className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </>
                  )}
                  {container.status !== 'running' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAction('start')}
                      disabled={isLoading}
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Reason Input */}
            {showReasonInput && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <Label htmlFor="reason">Lý do thực hiện hành động:</Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do (bắt buộc)..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReasonInput(false);
                      setPendingAction(null);
                      setActionReason("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={executeAction}
                    disabled={!actionReason.trim() || isLoading}
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cpu className="h-4 w-4" />
                  <span>CPU Usage</span>
                </div>
                <div className="text-2xl font-bold">{container.metrics.cpuUsage.toFixed(1)}%</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      container.metrics.cpuUsage > 80 ? 'bg-red-500' : 
                      container.metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(container.metrics.cpuUsage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="h-4 w-4" />
                  <span>Memory Usage</span>
                </div>
                <div className="text-2xl font-bold">{container.metrics.memoryUsage.toFixed(1)}%</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      container.metrics.memoryUsage > 90 ? 'bg-red-500' : 
                      container.metrics.memoryUsage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(container.metrics.memoryUsage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Uptime</span>
                </div>
                <div className="text-lg font-semibold">{formatUptime(container.uptime)}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created At</span>
                </div>
                <div className="text-sm">{format(new Date(container.createdAt), 'PPp', { locale: vi })}</div>
              </div>
            </div>

            <Separator />

            {/* Container Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Image className="h-4 w-4" />
                <span>Container Information</span>
              </div>
              
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between items-start py-2 border-b gap-4">
                  <span className="text-muted-foreground shrink-0 min-w-[140px]">Container Name</span>
                  <span className="font-mono text-xs text-right break-all">{container.containerName}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b gap-4">
                  <span className="text-muted-foreground shrink-0 min-w-[140px]">Image</span>
                  <span className="font-mono text-xs text-right break-all">{container.image}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b gap-4">
                  <span className="text-muted-foreground shrink-0 min-w-[140px]">Container ID</span>
                  <span className="font-mono text-xs text-right break-all">{container.containerId}</span>
                </div>
              </div>
            </div>

            {/* Ports */}
            {Object.keys(container.ports).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Network className="h-4 w-4" />
                    <span>Port Mappings</span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {Object.entries(container.ports).map(([containerPort, hostPort]) => (
                      <div key={containerPort} className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">{containerPort}</span>
                        <span className="font-mono text-xs">{hostPort}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Environment Variables */}
            {Object.keys(container.environment).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Settings className="h-4 w-4" />
                    <span>Environment Variables</span>
                  </div>
                  <div className="h-[250px] border rounded-lg p-4 overflow-y-auto bg-muted/30">
                    <div className="space-y-3 text-xs font-mono">
                      {Object.entries(container.environment).map(([key, value]) => (
                        <div key={key} className="pb-3 border-b last:border-0">
                          <div className="text-muted-foreground font-semibold mb-1">{key}</div>
                          <div className="mt-1 break-all">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Container Logs */}
            {container.logs && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Container Logs (Recent)</div>
                  <div className="h-[350px] border rounded-lg p-4 bg-muted/50 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
                      {container.logs}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
