"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import { AppLogsStreamData } from "@/types/app-monitoring";

interface AppLogsViewerProps {
  appId: string;
  maxLines?: number;
}

export function AppLogsViewer({ appId, maxLines = 500 }: AppLogsViewerProps) {
  const [logs, setLogs] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only create connection once per component lifecycle
    if (eventSourceRef.current) {
      return;
    }

    const setupStream = () => {
      try {
        const eventSource = AppMonitoringService.createLogsStream(appId, maxLines);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.addEventListener("app-logs", (event: MessageEvent) => {
          try {
            const data: AppLogsStreamData = JSON.parse(event.data);
            setLogs(data.logs || "");
          } catch (err) {
            console.error("Error parsing logs data:", err);
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          setError("Connection lost");
        };
      } catch (err) {
        console.error("Error creating logs stream:", err);
        setError("Failed to connect to logs stream");
      }
    };

    setupStream();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [appId, maxLines]);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Runtime Logs
            </CardTitle>
            <CardDescription>Container output and application logs</CardDescription>
          </div>
          {isConnected && (
            <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-black text-red-400 p-4 rounded-lg font-mono text-sm h-96 flex items-center justify-center">
            <p>{error}</p>
          </div>
        ) : !logs ? (
          <div className="bg-black text-gray-500 p-4 rounded-lg font-mono text-sm h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto mb-2"></div>
              <p>Loading logs...</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto"
            >
              <pre className="whitespace-pre-wrap break-words">{logs}</pre>
            </div>
            {!autoScroll && (
              <button
                onClick={() => {
                  setAutoScroll(true);
                  if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                  }
                }}
                className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs hover:bg-primary/90"
              >
                Scroll to bottom
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
