import { useEffect, useRef, useState } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  level?: string;
  service?: string;
}

interface UseLogStreamOptions {
  url: string;
  enabled?: boolean;
  onLog?: (log: LogEntry) => void;
  onError?: (error: Event) => void;
}

/**
 * Custom hook for Server-Sent Events (SSE) log streaming
 * 
 * @example
 * const { logs, isConnected, error } = useLogStream({
 *   url: '/api/v1/monitoring/logs/stream?type=ERROR',
 *   enabled: true
 * });
 */
export function useLogStream({ url, enabled = true, onLog, onError }: UseLogStreamOptions) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !url) {
      return;
    }

    // Get auth token from localStorage - same logic as api.ts
    let token: string | null = null;
    
    // Try Zustand persist key first (auth-storage)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token) {
          token = parsed.state.token;
          console.log('📍 Token found in auth-storage');
        }
      } catch (e) {
        console.warn('Failed to parse auth storage:', e);
      }
    }
    
    // Fallback to direct token key
    if (!token) {
      token = localStorage.getItem('auth_token');
      if (token) {
        console.log('📍 Token found in auth_token');
      }
    }
    
    // Check cookie as last resort
    if (!token) {
      token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1] || null;
      if (token) {
        console.log('📍 Token found in cookie');
      }
    }
      
    if (!token) {
      console.error('❌ No authentication token found in auth-storage, auth_token, or cookie');
      setError('No authentication token found');
      return;
    }

    // Build full URL with base API URL and add token as query param
    // EventSource doesn't support custom headers, so we pass token via URL
    // Remove /api prefix from url if baseUrl already contains it
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const cleanUrl = url.startsWith('/api/') && baseUrl.includes('/api') 
      ? url.substring(4) // Remove /api prefix
      : url;
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const fullUrl = `${baseUrl}${cleanUrl}${separator}auth_token=${encodeURIComponent(token)}`;

    const connectSSE = () => {
      console.log('🔌 Connecting to SSE:', fullUrl.replace(token, '***'));
      
      // EventSource - no custom headers support, auth via URL param
      const eventSource = new EventSource(fullUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log(' SSE Connected');
        setIsConnected(true);
        setError(null);
      };

      // Handle log events
      eventSource.addEventListener('logs', (event) => {
        try {
          const newLogs = JSON.parse(event.data) as LogEntry[];
          console.log('📨 Received logs:', newLogs.length);
          
          setLogs(prevLogs => {
            // Merge new logs and remove duplicates based on timestamp
            const combined = [...prevLogs, ...newLogs];
            const unique = Array.from(
              new Map(combined.map(log => [log.timestamp, log])).values()
            );
            // Keep only last 500 logs to prevent memory issues
            return unique.slice(-500);
          });

          // Call onLog callback for each log
          if (onLog) {
            newLogs.forEach(onLog);
          }
        } catch (err) {
          console.error(' Error parsing log data:', err);
        }
      });

      // Handle heartbeat
      eventSource.addEventListener('heartbeat', (event) => {
        console.log(' Heartbeat:', event.data);
      });

      eventSource.onerror = (err) => {
        console.error(' SSE Error:', err);
        setIsConnected(false);
        setError('Connection error - attempting to reconnect...');
        
        if (onError) {
          onError(err);
        }

        // Close current connection
        eventSource.close();

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(' Attempting to reconnect...');
          connectSSE();
        }, 5000);
      };
    };

    // Initial connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting SSE');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url, enabled, onLog, onError]);

  const clearLogs = () => {
    setLogs([]);
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return {
    logs,
    isConnected,
    error,
    clearLogs,
    disconnect
  };
}
