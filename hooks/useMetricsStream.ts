import { useEffect, useRef, useState, useCallback } from "react";
import type { MonitoringDashboard, ContainerMetric } from "@/types/monitoring.type";

interface MetricsStreamData {
  timestamp: number;
  dashboard: MonitoringDashboard;
  containers: ContainerMetric[];
}

interface UseMetricsStreamOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useMetricsStream(options: UseMetricsStreamOptions = {}) {
  const {
    enabled = true,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  // Keep callbacks in refs so effect doesn't re-run when parent passes inline functions
  const onErrorRef = useRef(onError);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  // Keep refs in sync
  onErrorRef.current = onError;
  onConnectRef.current = onConnect;
  onDisconnectRef.current = onDisconnect;

  // Use single state object to batch updates - prevents 3 separate re-renders
  const [state, setState] = useState<{
    dashboard: MonitoringDashboard | null;
    containers: ContainerMetric[];
    isConnected: boolean;
    lastUpdate: Date | null;
  }>({
    dashboard: null,
    containers: [],
    isConnected: false,
    lastUpdate: null,
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

  // Get token from localStorage
    const authStorage = localStorage.getItem("auth-storage");
    let token = "";

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token || "";
      } catch (e) {
        console.error("Failed to parse auth token:", e);
        onErrorRef.current?.(new Error("Authentication failed"));
        return;
      }
    }

    if (!token) {
      console.error("No authentication token found");
      onErrorRef.current?.(new Error("No authentication token"));
      return;
    }

    // Clean URL to prevent /api/api/ duplication
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
    const streamUrl = `${cleanBaseUrl}/api/v1/monitoring/metrics/stream?auth_token=${token}`;

    console.log("🔌 Connecting to metrics stream:", streamUrl);

    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("✅ Metrics stream connected");
      setState(prev => ({ ...prev, isConnected: true }));
      onConnectRef.current?.();
    };

    eventSource.addEventListener("metrics", (event) => {
      try {
        const data: MetricsStreamData = JSON.parse(event.data);

        // Batch all state updates into single render
        setState({
          dashboard: data.dashboard,
          containers: data.containers,
          lastUpdate: new Date(data.timestamp),
          isConnected: true,
        });
        } catch (error) {
        console.error("Failed to parse metrics data:", error);
        onErrorRef.current?.(error as Error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("❌ Metrics stream error:", error);
      setState(prev => ({ ...prev, isConnected: false }));
      onErrorRef.current?.(new Error("Stream connection error"));
      
      // EventSource will automatically reconnect
      // But we'll clean up and reconnect after 5 seconds if needed
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log("🔄 Attempting to reconnect metrics stream...");
          eventSource.close();
        }
      }, 5000);
    };

    // Cleanup on unmount or when enabled changes
    return () => {
      console.log("🔌 Disconnecting metrics stream");
      setState(prev => ({ ...prev, isConnected: false }));
      onDisconnectRef.current?.();
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [enabled]);

  return {
    dashboard: state.dashboard,
    containers: state.containers,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
  };
}
