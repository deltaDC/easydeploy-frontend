export default function SystemLogsPage() {
	return (
		<div className="grid gap-6">
			<h1 className="text-2xl font-semibold">Log hệ thống</h1>
			<pre className="card h-80 overflow-auto p-4 text-xs" style={{ background: "#f8fafc" }}>[00:00:00] No logs yet.</pre>
		</div>
	);
}
