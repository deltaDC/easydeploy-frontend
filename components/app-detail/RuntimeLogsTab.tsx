"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, ChevronDown, Filter } from "lucide-react";
import AppMonitoringService from "@/services/app-monitoring.service";
import { AppLogsStreamData } from "@/types/app-monitoring";
import { Skeleton } from "@/components/ui/skeleton";

interface RuntimeLogsTabProps {
  appId: string;
  maxLines?: number;
}

type LogLevel = "all" | "info" | "error" | "debug" | "warn";

const LOG_FILTERS: { id: LogLevel; label: string; color: string }[] = [
  { id: "all", label: "Tất cả", color: "text-charcoal" },
  { id: "info", label: "Info", color: "text-blue-600" },
  { id: "warn", label: "Warn", color: "text-amber-600" },
  { id: "error", label: "Error", color: "text-rose-600" },
  { id: "debug", label: "Debug", color: "text-slate-500" },
];

// Pill Filter Component
function PillFilter({
  filters,
  activeFilter,
  onFilterChange,
}: {
  filters: typeof LOG_FILTERS;
  activeFilter: LogLevel;
  onFilterChange: (filter: LogLevel) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-charcoal/50" />
      <div className="flex gap-1.5">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              soft-pill ${filter.color} opacity-70 hover:opacity-100
              ${activeFilter === filter.id
                ? "active bg-emerald-100/80 border-emerald-300/50 opacity-100"
                : ""
              }
            `}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Parse log line to extract level
function parseLogLevel(logLine: string): LogLevel {
  const lowerLine = logLine.toLowerCase();
  if (lowerLine.includes("[error]") || lowerLine.includes("error:") || lowerLine.includes("exception")) {
    return "error";
  }
  if (lowerLine.includes("[warn]") || lowerLine.includes("warning:")) {
    return "warn";
  }
  if (lowerLine.includes("[debug]") || lowerLine.includes("debug:")) {
    return "debug";
  }
  return "info";
}

// Get log line color based on level
function getLogLineColor(level: LogLevel): string {
  switch (level) {
    case "error":
      return "log-level-error";
    case "warn":
      return "log-level-warn";
    case "debug":
      return "text-slate-500";
    default:
      return "log-level-info";
  }
}

export function RuntimeLogsTab({ appId, maxLines = 500 }: RuntimeLogsTabProps) {
  const [logs, setLogs] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LogLevel>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (eventSourceRef.current) return;

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
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          setError("Mất kết nối. Đang thử kết nối lại...");
          
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          
          setTimeout(() => {
            if (!eventSourceRef.current) {
              setupStream();
            }
          }, 3000);
        };
      } catch (err) {
        setError("Không thể kết nối đến luồng log");
        setIsConnected(false);
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

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  // Filter and parse logs
  const filteredLogLines = logs
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => ({
      text: line,
      level: parseLogLevel(line),
    }))
    .filter((log) => activeFilter === "all" || log.level === activeFilter);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="glass-card border-0 overflow-hidden shadow-sage-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-charcoal">
                <Terminal className="h-5 w-5" strokeWidth={1.5} />
                Nhật ký Runtime
              </CardTitle>
              <CardDescription className="text-charcoal/60">
                Output container và log ứng dụng
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter Pills */}
              <PillFilter
                filters={LOG_FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Connection Status */}
              {isConnected && (
                <span className="flex items-center gap-2 text-sm text-emerald-600">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full live-indicator" />
                  Live
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Terminal Window */}
          <div 
            className="mx-4 mb-4 rounded-lg overflow-hidden shadow-charcoal-inset relative terminal-inner-shadow terminal-scrollbar"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            {/* Corner mist effect - only at corners */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-br-full pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-tr-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-tl-full pointer-events-none" />
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>runtime-logs</span>
              {activeFilter !== "all" && (
                <span className="text-xs text-slate-400 ml-auto" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
                  Lọc: {LOG_FILTERS.find((f) => f.id === activeFilter)?.label}
                </span>
              )}
              
              {/* Live Indicator */}
              {isConnected && (
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full live-indicator" />
                  <span className="text-xs text-emerald-400 font-mono live-indicator" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>Live</span>
                </div>
              )}
            </div>

            {/* Terminal Content */}
            {error ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            ) : !logs ? (
              <div className="h-80 space-y-2 p-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-80 overflow-y-auto p-4 font-mono text-sm terminal-scrollbar relative z-10"
              >
                {filteredLogLines.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">
                      {activeFilter === "all"
                        ? "Không có log nào"
                        : `Không có log ${activeFilter} nào`}
                    </p>
                  </div>
                ) : (
                  filteredLogLines.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: index * 0.01 }}
                      className={`whitespace-pre-wrap break-words mb-0.5 ${getLogLineColor(log.level)}`}
                      style={{ 
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontWeight: 500,
                        color: log.level === 'error' ? '#f87171' : log.level === 'warn' ? '#fbbf24' : '#34D399',
                        textShadow: log.level === 'error' 
                          ? '0 0 8px rgba(248, 113, 113, 0.5)' 
                          : log.level === 'warn'
                          ? '0 0 6px rgba(251, 191, 36, 0.4)'
                          : '0 0 8px rgba(52, 211, 153, 0.5)'
                      }}
                    >
                      {log.text}
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Scroll to Bottom */}
            <AnimatePresence>
              {!autoScroll && logs && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 right-4"
                >
                  <Button
                    size="sm"
                    onClick={() => {
                      setAutoScroll(true);
                      scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                    className="soft-pill text-white/90 hover:text-white hover:bg-white/25 shadow-lg haptic-button opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-4 w-4 mr-1 auto-scroll-indicator" />
                    Cuộn xuống
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}