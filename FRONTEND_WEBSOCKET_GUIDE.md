# Frontend WebSocket Guide - Real-time Build Logs

## Overview
Connect to WebSocket to receive real-time build logs from Jenkins deployments.

## Installation

```bash
npm install sockjs-client @stomp/stompjs
```

## Quick Start

### 1. Create WebSocket Hook

Create `hooks/useBuildLogs.ts`:

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface LogMessage {
  buildId: string;
  applicationId: string;
  message: string;
  logLevel: string;
  timestamp: string;
  logLineNumber?: number;
}

export function useBuildLogs(buildId: string | null) {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!buildId) return;

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe(`/topic/build-logs/${buildId}`, (message) => {
          try {
            const logMessage: LogMessage = JSON.parse(message.body);
            setLogs((prev) => [...prev, logMessage]);
          } catch (error) {
            console.error('Failed to parse log:', error);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    clientRef.current = stompClient;
    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [buildId]);

  return { logs, connected };
}
```

### 2. Create Log Viewer Component

Create `components/BuildLogViewer.tsx`:

```typescript
'use client';

import { useBuildLogs } from '@/hooks/useBuildLogs';
import { useEffect, useRef } from 'react';

interface Props {
  buildId: string;
}

export default function BuildLogViewer({ buildId }: Props) {
  const { logs, connected } = useBuildLogs(buildId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (level: string) => {
    if (level === 'ERROR') return 'text-red-500';
    if (level === 'WARN') return 'text-yellow-500';
    if (level === 'DEBUG') return 'text-gray-500';
    return 'text-gray-300';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="flex-1 overflow-auto bg-black p-4 font-mono text-sm rounded">
        {logs.length === 0 ? (
          <div className="text-gray-500">Waiting for logs...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={getColor(log.logLevel)}>
              [{log.logLevel}] {log.message}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
```

### 3. Use in Your Page

```typescript
'use client';

import BuildLogViewer from '@/components/BuildLogViewer';

export default function BuildPage({ params }: { params: { buildId: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Build Logs</h1>
      <BuildLogViewer buildId={params.buildId} />
    </div>
  );
}
```

## Message Format

Each log message from WebSocket:

```json
{
  "buildId": "uuid",
  "applicationId": "uuid",
  "message": "Build log line text",
  "logLevel": "INFO" | "ERROR" | "WARN" | "DEBUG",
  "timestamp": "2025-11-02T23:14:32",
  "logLineNumber": 42
}
```

## Connection Flow

1. **Build Started**: Stream initialized when deployment is triggered
2. **Connect**: Frontend connects to `/ws` endpoint
3. **Subscribe**: Subscribe to `/topic/build-logs/{buildId}`
4. **Receive**: Real-time logs stream in as they're generated
5. **Complete**: Final "Build Completed" message when done

## API Endpoint

**WebSocket URL**: `ws://localhost:8080/ws` (or your backend URL)

**Subscribe To**: `/topic/build-logs/{buildId}`

Replace `{buildId}` with actual build UUID.

## Example: Trigger Deployment

```typescript
async function triggerDeployment(applicationId: string) {
  const response = await fetch('/api/v1/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ /* your deployment config */ })
  });
  
  const data = await response.json();
  const buildId = data.buildId;
  
  router.push(`/builds/${buildId}`);
}
```

## Troubleshooting

**Not receiving logs?**
- Check if buildId is correct
- Verify WebSocket connection status
- Check browser console for errors
- Ensure backend is running and Redis is connected

**Connection drops?**
- STOMP client auto-reconnects (5s delay)
- Check network connectivity
- Verify backend `/ws` endpoint is accessible

**Logs not appearing?**
- Wait a few seconds after deployment trigger
- Check if build is actually running in Jenkins
- Verify buildId matches the one in your subscription

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

