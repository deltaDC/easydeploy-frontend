"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import type { SystemLog } from "@/types/monitoring.type";

interface LogsViewerProps {
  logs: SystemLog[];
  onRefresh: () => void;
  isLoading?: boolean;
  title?: string;
}

export default function LogsViewer({ logs, onRefresh, isLoading = false, title = "System Logs" }: LogsViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState<string>("all");

  const filteredLogs = logs.filter(log => {
    if (!searchTerm && logLevel === 'all') return true;
    
    const matchesSearch = searchTerm === '' || log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevel === 'all' || log.level.toLowerCase() === logLevel.toLowerCase();
      
      return matchesSearch && matchesLevel;
  });

  const handleDownload = () => {
    const logsText = filteredLogs.map(log => 
      `${log.timestamp} [${log.level}] ${log.source || ''} - ${log.message}`
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
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
          <div className="h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/50 font-mono text-xs">
            {filteredLogs.length > 0 ? (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div key={index} className={`${getLogLevelColor(log.level)} hover:bg-muted/80 px-2 py-0.5 rounded flex gap-2`}>
                    <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                    <span className="font-semibold shrink-0">[{log.level}]</span>
                    {log.source && <span className="text-muted-foreground shrink-0">{log.source}:</span>}
                    <span className="break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No logs available
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
