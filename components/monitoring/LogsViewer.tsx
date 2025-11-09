/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, RefreshCw, Search, Radio } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLogStream } from "@/hooks/useLogStream";
import { toast } from "sonner";
import type { SystemLog } from "@/types/monitoring.type";

interface LogsViewerProps {
  logs: SystemLog[];
  onRefresh?: () => void;
  isLoading?: boolean;
  title?: string;
}

export default function LogsViewer({ logs, onRefresh, isLoading = false, title = "System Logs (Real-time)" }: LogsViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState<string>("all");
  const [combinedLogs, setCombinedLogs] = useState<SystemLog[]>(logs);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Setup SSE stream - ALWAYS ENABLED
  const sseUrl = logLevel !== "all" 
    ? `/api/v1/monitoring/logs/stream?type=${logLevel.toUpperCase()}`
    : `/api/v1/monitoring/logs/stream`;
    
  const { logs: streamLogs, isConnected, error: streamError } = useLogStream({
    url: sseUrl,
    enabled: true, // Always enabled - real-time by default
    onLog: (log) => {
      console.log(' New real-time log received:', log);
      // Auto-scroll to bottom on new log - only scroll container, not whole page
      setTimeout(() => {
        if (logsContainerRef.current) {
          logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  });

  // Debug: Log connection status
  useEffect(() => {
    console.log(' SSE Connection Status:', 
      '\n  - Connected:', isConnected,
      '\n  - Error:', streamError,
      '\n  - Stream logs count:', streamLogs.length,
      '\n  - SSE URL:', sseUrl
    );
  }, [isConnected, streamError, streamLogs.length, sseUrl]);

  // Merge static logs with streamed logs - ALWAYS REAL-TIME (using useMemo)
  const combinedLogsComputed = useMemo(() => {
    // Convert LogEntry to SystemLog format
    const convertedStreamLogs: SystemLog[] = streamLogs.map(log => ({
      timestamp: log.timestamp,
      level: (log.level?.toUpperCase() || 'INFO') as 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
      source: log.service || 'backend',
      message: log.message
    }));
    
    const allLogs = [...logs, ...convertedStreamLogs];
    
    // Remove duplicates based on timestamp + message
    const uniqueLogs = allLogs.filter(
      (log, index, self) =>
        index === self.findIndex((l) => 
          l.timestamp === log.timestamp && l.message === log.message
        )
    );
    
    // Sort by timestamp (oldest first - newest at bottom)
    uniqueLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return uniqueLogs;
  }, [logs, streamLogs]);

  // Update state only when computed value changes
  useEffect(() => {
    setCombinedLogs(combinedLogsComputed);
  }, [combinedLogsComputed]);

  // Show toast on connection status change
  useEffect(() => {
    if (isConnected) {
      toast.success(" Real-time logs connected");
    }
  }, [isConnected]);

  useEffect(() => {
    if (streamError) {
      toast.error(` ${streamError}`);
    }
  }, [streamError]);

  const filteredLogs = combinedLogs.filter(log => {
    if (!searchTerm && logLevel === 'all') return true;
    
    const matchesSearch = searchTerm === '' || log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevel === 'all' || log.level.toLowerCase() === logLevel.toLowerCase();
      
      return matchesSearch && matchesLevel;
  });

  const handleDownload = () => {
    const logsText = filteredLogs.map(log => 
      `${formatTimestamp(log.timestamp)} [${log.level}] ${log.source || ''} - ${log.message}`
    ).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Format timestamp to local timezone (UTC+7)
  const formatTimestamp = (timestamp: string) => {
    try {
      let date: Date;
      
      // Check if timestamp has timezone info
      if (timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-', 10)) {
        // Has timezone: 2025-11-05T14:52:06Z or 2025-11-05T14:52:06+07:00
        date = new Date(timestamp);
      } else if (timestamp.includes('T')) {
        // Has T but no timezone: 2025-11-05T14:52:06.123456789 (assumed UTC)
        // Add Z to indicate UTC
        const isoString = timestamp + 'Z';
        date = new Date(isoString);
      } else {
        // Plain format: "2025-11-05 14:52:06" (assumed UTC)
        // Convert to ISO format by replacing space with T and adding Z
        const isoString = timestamp.replace(' ', 'T') + 'Z';
        date = new Date(isoString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      
      // Format using local timezone: YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return timestamp; // Return original if parsing fails
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
      case 'FATAL':
        return 'text-red-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-500';
      case 'DEBUG':
        return 'text-gray-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Log Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div ref={logsContainerRef} className="h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/50 font-mono text-xs">
            {filteredLogs.length > 0 ? (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div key={index} className={`${getLogLevelColor(log.level)} hover:bg-muted/80 px-2 py-0.5 rounded flex gap-2`}>
                    <span className="text-muted-foreground shrink-0">{formatTimestamp(log.timestamp)}</span>
                    <span className="font-semibold shrink-0">[{log.level}]</span>
                    {log.source && <span className="text-muted-foreground shrink-0">{log.source}:</span>}
                    <span className="break-all">{log.message}</span>
                  </div>
                ))}
                {/* Anchor for auto-scroll */}
                <div ref={logsEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {!isConnected ? (
                  <div className="text-center space-y-2">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p>Connecting to real-time log stream...</p>
                  </div>
                ) : (
                  <p>No logs available</p>
                )}
              </div>
            )}
          </div>
          
          {/* Log count */}
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {filteredLogs.length} lines
            {searchTerm && ` (filtered)`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
