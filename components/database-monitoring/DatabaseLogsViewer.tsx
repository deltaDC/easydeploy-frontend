"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Download, Pause, Play, Trash2 } from "lucide-react";
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
  const [newestLineIndex, setNewestLineIndex] = useState<number>(-1);
  
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
            const oldLines = logs.split('\n').length;
            const newLines = newLogs.split('\n').length;
            if (newLines > oldLines) {
              setNewestLineIndex(newLines - 1);
              setTimeout(() => setNewestLineIndex(-1), 2000); // Flash for 2 seconds
            }
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

  const handleClear = () => {
    setLogs("");
    pausedLogsRef.current = "";
  };

  // Parse log line and apply colors
  const parseLogLine = (line: string, index: number) => {
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}[.\d]*Z?[\s]*)/);
    const timestamp = timestampMatch ? timestampMatch[1] : "";
    const rest = timestampMatch ? line.slice(timestampMatch[0].length) : line;
    
    let logType = "INFO";
    let color = "#A7F3D0"; // Mint green for INFO
    
    if (rest.toUpperCase().includes("ERROR") || rest.toUpperCase().includes("FATAL")) {
      logType = "ERROR";
      color = "#FBCFE8"; // Pastel pink
    } else if (rest.toUpperCase().includes("WARN") || rest.toUpperCase().includes("WARNING")) {
      logType = "WARN";
      color = "#FEF3C7"; // Cream yellow
    }
    
    const isNewest = index === newestLineIndex;
    
    return (
      <motion.div
        key={index}
        initial={isNewest ? { opacity: 0, backgroundColor: "rgba(167, 243, 208, 0.3)" } : false}
        animate={isNewest ? { 
          opacity: [0, 1, 1, 0.7],
          backgroundColor: ["rgba(167, 243, 208, 0.3)", "rgba(167, 243, 208, 0.1)", "transparent", "transparent"]
        } : {}}
        transition={{ duration: 2 }}
        className="py-1"
      >
        <span className="text-slate-400">{timestamp}</span>
        <span style={{ color }}>{rest}</span>
      </motion.div>
    );
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
          <div className="flex gap-2 group/controls">
            {/* Transparent icons, only visible on hover */}
            <motion.button
              onClick={handlePauseToggle}
              className="opacity-0 group-hover/controls:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPaused ? (
                <Play className="h-4 w-4 text-white/70" />
              ) : (
                <Pause className="h-4 w-4 text-white/70" />
              )}
            </motion.button>
            <motion.button
              onClick={handleDownload}
              disabled={!logs}
              className="opacity-0 group-hover/controls:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Download className="h-4 w-4 text-white/70" />
            </motion.button>
            <motion.button
              onClick={handleClear}
              disabled={!logs}
              className="opacity-0 group-hover/controls:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="h-4 w-4 text-white/70" />
            </motion.button>
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
            className="terminal-misty-logs p-6 rounded-xl h-96 overflow-y-auto whitespace-pre-wrap break-words terminal-scrollbar"
            style={{
              background: "rgba(15, 23, 42, 0.85)", // #0F172A with 85% opacity
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.5), inset 20px 0 40px rgba(0, 0, 0, 0.3), inset -20px 0 40px rgba(0, 0, 0, 0.3), inset 0 20px 40px rgba(0, 0, 0, 0.3), inset 0 -20px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            {logs.split('\n').map((line, index) => parseLogLine(line, index))}
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
