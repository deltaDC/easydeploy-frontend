"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Play, Pause, RotateCcw, Settings } from "lucide-react";
import Link from "next/link";
import ApplicationService from "@/services/application.service";
import BuildLogService from "@/services/build-log.service";
import { ApplicationDetail } from "@/types/application.type";
import { BuildLog, BuildLogMessage } from "@/types/build-log.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { useBuildLogWebSocket } from "@/hooks/useBuildLogWebSocket";

export default function ApplicationDetailPage() {
	const params = useParams<{ appId: string }>();
	const appId = params?.appId;

	const [application, setApplication] = useState<ApplicationDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [logs, setLogs] = useState<BuildLogMessage[]>([]);
	const [isLoadingLogs, setIsLoadingLogs] = useState(true);
	const logsEndRef = useRef<HTMLDivElement>(null);

	console.log("appId", appId);

	useEffect(() => {
		const fetchHistoricalLogs = async () => {
			if (!appId) return;

			try {
				setIsLoadingLogs(true);
				const response = await BuildLogService.getBuildLogsPaginated(appId, 0, 500);
				const convertedLogs: BuildLogMessage[] = response.content.map((log) => ({
					buildId: log.buildId,
					applicationId: appId,
					message: log.message || "",
					logLevel: "INFO",
					timestamp: log.timestamp,
				}));
				console.log("Converted logs:", convertedLogs);
				setLogs(convertedLogs);
				console.log("Logs:", logs);
			} catch (error) {
				console.error("Error fetching build logs:", error);
			} finally {
				setIsLoadingLogs(false);
			}
		};

		fetchHistoricalLogs();
	}, [appId]);

	const { isConnected } = useBuildLogWebSocket({
		buildId: appId,
		enabled: !!appId,
		onMessage: (logMessage) => {
			console.log("Received log message:", logMessage);
			setLogs((prev) => [...prev, logMessage]);
		},
		onError: (error) => {
			console.error("WebSocket error:", error);
		},
	});

	// Sort logs by timestamp (oldest first, newest last)
	const sortedLogs = useMemo(() => {
		return [...logs].sort((a, b) => {
			const timeA = new Date(a.timestamp).getTime();
			const timeB = new Date(b.timestamp).getTime();
			return timeA - timeB;
		});
	}, [logs]);

	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [sortedLogs]);

	useEffect(() => {
		const fetchApplication = async () => {
			try {
				const response = await ApplicationService.getApplication(appId);
				setApplication(response);
			} catch (error) {
				console.error("Error fetching application:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (appId) {
			fetchApplication();
		}
	}, [appId]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading application details...</p>
				</div>
			</div>
		);
	}

	if (!application) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-semibold mb-2">Application not found</h2>
				<p className="text-muted-foreground mb-4">The application you are looking for does not exist.</p>
				<Button asChild>
					<Link href="/apps">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Applications
					</Link>
				</Button>
			</div>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "running":
				return "bg-green-100 text-green-800";
			case "in_progress":
				return "bg-blue-100 text-blue-800";
			case "error":
				return "bg-red-100 text-red-800";
			case "idle":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getLogLevelColor = (level: string) => {
		if (level === "ERROR") return "text-red-500";
		if (level === "WARN") return "text-yellow-500";
		if (level === "DEBUG") return "text-gray-500";
		return "text-gray-300";
	};

	return (
		<div className="grid gap-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="sm" asChild>
					<Link href="/apps">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">{application.name}</h1>
					<p className="text-muted-foreground">Application Details</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Application Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">Status</label>
									<div className="mt-1">
										<Badge className={getStatusColor(application.status)}>
											{application.status}
										</Badge>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">Container ID</label>
									<p className="mt-1 text-sm font-mono">{application.containerId || "N/A"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">Public URL</label>
									<div className="mt-1 flex items-center gap-2">
										{application.publicUrl ? (
											<a
												href={application.publicUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-primary hover:underline flex items-center gap-1"
											>
												{application.publicUrl}
												<ExternalLink className="h-3 w-3" />
											</a>
										) : (
											<p className="text-sm text-muted-foreground">Not deployed yet</p>
										)}
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">Created</label>
									<p className="mt-1 text-sm">{formatDateDDMMYYYYHHMMSS(application.createdAt)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{application.deployConfig && (
						<Card>
							<CardHeader>
								<CardTitle>Deploy Configuration</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">Build Command</label>
										<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.buildCommand || "N/A"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Start Command</label>
										<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.startCommand || "N/A"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Exposed Port</label>
										<p className="mt-1 text-sm">{application.deployConfig.exposedPort || "N/A"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Auto Redeploy</label>
										<p className="mt-1 text-sm">{application.deployConfig.autoRedeploy ? "Enabled" : "Disabled"}</p>
									</div>
									{application.deployConfig.publishDir && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">Publish Directory</label>
											<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.publishDir}</p>
										</div>
									)}
									{application.deployConfig.rootDir && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">Root Directory</label>
											<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.rootDir}</p>
										</div>
									)}
									{application.deployConfig.healthCheckPath && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">Health Check Path</label>
											<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.healthCheckPath}</p>
										</div>
									)}
								</div>
								{application.deployConfig.environmentVars && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">Environment Variables</label>
										<div className="mt-2 space-y-2">
											{Object.entries(JSON.parse(application.deployConfig.environmentVars)).map(([key, value]) => (
												<div key={key} className="flex gap-2">
													<input
														type="text"
														value={key}
														disabled
														className="flex-1 px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md text-gray-600"
													/>
													<input
														type="text"
														value={value as string}
														disabled
														className="flex-1 px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md text-gray-600"
													/>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button className="w-full justify-start" variant="outline">
								<Play className="h-4 w-4 mr-2" />
								Start
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<Pause className="h-4 w-4 mr-2" />
								Stop
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<RotateCcw className="h-4 w-4 mr-2" />
								Redeploy
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<Settings className="h-4 w-4 mr-2" />
								Configure
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
			<div>
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Build Logs</CardTitle>
								<CardDescription>
									Real-time build logs from Jenkins
									{isConnected && (
										<span className="ml-2 inline-flex items-center gap-1">
											<span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
											<span className="text-xs text-green-600">Live</span>
										</span>
									)}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{isLoadingLogs ? (
							<div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 flex items-center justify-center">
								<div className="text-center">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto mb-2"></div>
									<p className="text-xs">Loading logs...</p>
								</div>
							</div>
						) : sortedLogs.length === 0 ? (
							<div className="bg-black text-gray-500 p-4 rounded-lg font-mono text-sm h-64 flex items-center justify-center">
								<p>No build logs available yet. Logs will appear here when a build is triggered.</p>
							</div>
						) : (
							<div className="bg-black p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
								{sortedLogs.map((log, index) => (
									<div key={`${log.timestamp}-${index}`} className={`mb-1 whitespace-pre-wrap break-words ${getLogLevelColor(log.logLevel)}`}>
										<span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
										<span className="text-gray-400">[{log.logLevel}]</span>{" "}
										<span>{log.message || ""}</span>
									</div>
								))}
								<div ref={logsEndRef} />
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}