import { use } from "react";

export default function AppLogsPage({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
    return (
        <div className="grid gap-6">
            <h1 className="text-2xl font-semibold">Logs ứng dụng #{appId}</h1>
            <pre className="card h-80 overflow-auto p-4 text-xs" style={{ background: "#f8fafc" }}>[00:00:00] Waiting for logs...</pre>
        </div>
    );
}
