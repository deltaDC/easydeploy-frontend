"use client";

import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContainerMetric } from "@/types/monitoring.type";
import { Server, Cpu, HardDrive, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ContainersListProps {
  containers: ContainerMetric[];
  onViewDetail: (containerId: string) => void;
}

function ContainersList({ containers, onViewDetail }: ContainersListProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 2 rows x 3 columns
  
  // Calculate pagination
  const totalPages = Math.ceil(containers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContainers = containers.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'restarting':
        return 'bg-blue-500';
      case 'dead':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'running':
        return 'default';
      case 'stopped':
        return 'secondary';
      case 'dead':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (containers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Server className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Không có container nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentContainers.map((container) => (
        <Card 
          key={container.containerId} 
          className="hover:shadow-md transition-all"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  {container.appName || container.containerName}
                </CardTitle>
                <p className="text-xs text-muted-foreground truncate">
                  {container.containerName}
                </p>
              </div>
              <Badge variant={getStatusVariant(container.status)} className="capitalize">
                {container.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* CPU Usage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Cpu className="h-3 w-3" />
                  CPU
                </span>
                <span className="font-medium">{container.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    container.cpuUsage > 80 ? 'bg-red-500' : 
                    container.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(container.cpuUsage, 100)}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <HardDrive className="h-3 w-3" />
                  Memory
                </span>
                <span className="font-medium">{container.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    container.memoryUsage > 90 ? 'bg-red-500' : 
                    container.memoryUsage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(container.memoryUsage, 100)}%` }}
                />
              </div>
            </div>

            {/* Uptime */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Uptime
              </span>
              <span>{formatUptime(container.uptime)}</span>
            </div>

            {/* View Detail Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onViewDetail(container.containerId)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </CardContent>
        </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, containers.length)} trong tổng số {containers.length} containers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <div className="text-sm font-medium">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ContainersList, (prevProps, nextProps) => {
  // Only re-render if containers actually changed (deep comparison of metrics)
  if (prevProps.containers.length !== nextProps.containers.length) return false;
  
  // Check if any container metrics changed
  return prevProps.containers.every((prev, index) => {
    const next = nextProps.containers[index];
    return (
      prev.containerId === next.containerId &&
      prev.cpuUsage === next.cpuUsage &&
      prev.memoryUsage === next.memoryUsage &&
      prev.status === next.status &&
      prev.uptime === next.uptime
    );
  });
});
