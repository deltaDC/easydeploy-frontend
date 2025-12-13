"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Download, Pause, Play } from "lucide-react";
import DatabaseMonitoringService from "@/services/database-monitoring.service";

interface DatabaseLogsViewerProps {
  databaseId: string;
  maxLines?: number;
}

export function DatabaseLogsViewer({ databaseId, maxLines = 100 }: DatabaseLogsViewerProps) {
  const [logs, setLogs] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [databaseStatus, setDatabaseStatus] = useState<{ isHealthy: boolean; healthMessage: string } | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedLogsRef = useRef<string>("");

  useEffect(() => {
    if (eventSourceRef.current) {
      return;
    }

    try {
      const eventSource = DatabaseMonitoringService.createLogsStream(databaseId, maxLines);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("Database logs SSE connection opened");
        setIsConnected(true);
        setError(null);
      };

      
      eventSource.addEventListener("database-logs", (event: MessageEvent) => {
        
        try {
          const data = JSON.parse(event.data);
          const newLogs = data.logs || "";

          if (isPaused) {
            pausedLogsRef.current = newLogs;
          } else {
            setLogs(newLogs);
          }
          
          setIsConnected(true); // Ensure connected status
        } catch (err) {
          console.error("Error parsing database logs:", err, event.data);
        }
      });

      eventSource.addEventListener("error", (event: MessageEvent) => {
        console.error("SSE logs error event:", event);
        setError("Error receiving logs");
      });

      eventSource.onerror = (error) => {
        console.error("SSE logs connection error:", error);
        setIsConnected(false);
        setError("Connection lost");
      };
    } catch (err) {
      console.error("Error creating database logs stream:", err);
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => setError("Failed to connect to logs stream"));
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [databaseId, maxLines, isPaused]);

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const metrics = await DatabaseMonitoringService.getDatabaseMetrics(databaseId);
        setDatabaseStatus({
          isHealthy: metrics.isHealthy,
          healthMessage: metrics.healthMessage || ""
        });
      } catch (err) {
        console.error("Failed to get database status:", err);
      }
    };
    
    checkDatabaseStatus();
    const interval = setInterval(checkDatabaseStatus, 10000);
    
    return () => clearInterval(interval);
  }, [databaseId]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setAutoScroll(isAtBottom);
    }
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resume: apply paused logs
      setLogs(pausedLogsRef.current);
      setIsPaused(false);
    } else {
      // Pause
      setIsPaused(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `database-${databaseId}-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Database Logs
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              {(() => {
                const displayConnected = databaseStatus?.isHealthy || isConnected;
                const displayError = error && (!databaseStatus || !databaseStatus.isHealthy) ? error : null;
                
                return (
                  <>
                    {displayConnected && !displayError && (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-600">Live</span>
                      </span>
                    )}
                    {displayError && (
                      <Badge variant="destructive" className="text-xs">{displayError}</Badge>
                    )}
                    {isPaused && (
                      <Badge variant="secondary" className="text-xs">Paused</Badge>
                    )}
                  </>
                );
              })()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseToggle}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!logs}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!logs ? (
          <div className="bg-black text-gray-500 p-4 rounded-lg font-mono text-sm h-96 flex items-center justify-center">
            <div className="text-center">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No logs available yet. Logs will appear here when the database generates output.</p>
            </div>
          </div>
        ) : (
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto whitespace-pre-wrap break-words"
          >
            {logs}
          </div>
        )}
        {!autoScroll && (
          <div className="mt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAutoScroll(true);
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
              }}
            >
              Scroll to bottom
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
