"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Play, Pause, RotateCcw, Settings, Activity, Terminal, FileText, Trash2, History } from "lucide-react";
import Link from "next/link";
import ApplicationService from "@/services/application.service";
import BuildLogService from "@/services/build-log.service";
import AppMonitoringService from "@/services/app-monitoring.service";
import { ApplicationDetail } from "@/types/application.type";
import { BuildLog, BuildLogMessage } from "@/types/build-log.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import { translateStatus } from "@/lib/status-translations";
import { useBuildLogWebSocket } from "@/hooks/useBuildLogWebSocket";
import { AppMetricsChartCard } from "@/components/app-monitoring/AppMetricsChartCard";
import { AppLogsViewer } from "@/components/app-monitoring/AppLogsViewer";
import { DeploymentHistoryTab } from "@/components/app-monitoring/DeploymentHistoryTab";
import { AppControlActions } from "@/components/app-monitoring/AppControlActions";

export default function ApplicationDetailPage() {
	const params = useParams<{ appId: string }>();
	const appId = params?.appId;

	const [application, setApplication] = useState<ApplicationDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [logs, setLogs] = useState<BuildLogMessage[]>([]);
	const [isLoadingLogs, setIsLoadingLogs] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [containerStatus, setContainerStatus] = useState<string | undefined>();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const logsEndRef = useRef<HTMLDivElement>(null);

	// Remove console.log to reduce noise
	// console.log("appId", appId);

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
		} catch (error) {
			console.error("Error fetching build logs:", error);
		} finally {
			setIsLoadingLogs(false);
		}
	};

	fetchHistoricalLogs();
}, [appId]);	const { isConnected } = useBuildLogWebSocket({
		buildId: null, // Don't subscribe to specific build, subscribe to application logs
		applicationId: appId, // Subscribe to all logs for this application
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
				
				const isDeploying = ["deploying", "in_progress", "pending"].includes(response.status.toLowerCase());
				if (!isDeploying) {
					try {
						const metrics = await AppMonitoringService.getAppMetrics(appId);
						setContainerStatus(metrics.status);
					} catch (err) {
						console.error("Error fetching container status:", err);
					}
				} else {
					// App is being deployed, set status accordingly
					setContainerStatus("deploying");
				}
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
					<p className="text-muted-foreground">Đang tải chi tiết ứng dụng...</p>
				</div>
			</div>
		);
	}

	if (!application) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-semibold mb-2">Không tìm thấy ứng dụng</h2>
				<p className="text-muted-foreground mb-4">Ứng dụng bạn đang tìm kiếm không tồn tại.</p>
				<Button asChild>
					<Link href="/apps">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại danh sách ứng dụng
					</Link>
				</Button>
			</div>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "running":
				return "bg-green-100 text-green-800";
			case "deploying":
			case "in_progress":
			case "pending":
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

	const handleDeleteApp = async () => {
		if (!appId) return;
		
		try {
			setIsDeleting(true);
			await ApplicationService.deleteApplication(appId);
			window.location.href = '/apps';
		} catch (error) {
			console.error("Error deleting application:", error);
			alert("Không thể xóa ứng dụng. Vui lòng thử lại.");
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	return (
		<div className="grid gap-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="sm" asChild>
						<Link href="/apps">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold">{application.name}</h1>
						<p className="text-muted-foreground">Chi tiết ứng dụng và Giám sát</p>
					</div>
				</div>
				<Button 
					variant="destructive" 
					size="sm"
					onClick={() => setShowDeleteConfirm(true)}
					disabled={isDeleting}
				>
					<Trash2 className="h-4 w-4 mr-2" />
					{isDeleting ? 'Đang xóa...' : 'Xóa App'}
				</Button>
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-md">
						<CardHeader>
							<CardTitle>Xác nhận xóa ứng dụng</CardTitle>
							<CardDescription>
								Bạn có chắc chắn muốn xóa ứng dụng &quot;{application.name}&quot;? Hành động này không thể hoàn tác.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex gap-2 justify-end">
							<Button 
								variant="outline" 
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
							>
								Hủy
							</Button>
							<Button 
								variant="destructive" 
								onClick={handleDeleteApp}
								disabled={isDeleting}
							>
								{isDeleting ? 'Đang xóa...' : 'Xóa'}
							</Button>
						</CardContent>
					</Card>
				</div>
			)}

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Tổng quan
					</TabsTrigger>
					<TabsTrigger value="metrics" className="flex items-center gap-2">
						<Activity className="h-4 w-4" />
						Hiệu suất
					</TabsTrigger>
					<TabsTrigger value="logs" className="flex items-center gap-2">
						<Terminal className="h-4 w-4" />
						Nhật ký thời gian thực
					</TabsTrigger>
					<TabsTrigger value="build-logs" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Nhật ký build
					</TabsTrigger>
					<TabsTrigger value="history" className="flex items-center gap-2">
						<History className="h-4 w-4" />
						Lịch sử
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6" forceMount hidden={activeTab !== "overview"}>
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Thông tin ứng dụng</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
											<div className="mt-1">
												<Badge className={getStatusColor(application.status)}>
													{translateStatus(application.status)}
												</Badge>
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">ID Container</label>
											<p className="mt-1 text-sm font-mono break-all">{application.containerId || "Chưa có"}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">URL công khai</label>
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
													<p className="text-sm text-muted-foreground">Chưa được triển khai</p>
												)}
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
											<p className="mt-1 text-sm">{formatDateDDMMYYYYHHMMSS(application.createdAt)}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{application.deployConfig && (
								<Card>
									<CardHeader>
										<CardTitle>Cấu hình triển khai</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-muted-foreground">Lệnh build</label>
												<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.buildCommand || "Chưa có"}</p>
											</div>
											<div>
												<label className="text-sm font-medium text-muted-foreground">Lệnh khởi động</label>
												<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.startCommand || "Chưa có"}</p>
											</div>
											<div>
												<label className="text-sm font-medium text-muted-foreground">Cổng công khai</label>
												<p className="mt-1 text-sm">{application.deployConfig.exposedPort || "Chưa có"}</p>
											</div>
											<div>
												<label className="text-sm font-medium text-muted-foreground">Tự động triển khai lại</label>
												<p className="mt-1 text-sm">{application.deployConfig.autoRedeploy ? "Bật" : "Tắt"}</p>
											</div>
											{application.deployConfig.publishDir && (
												<div>
													<label className="text-sm font-medium text-muted-foreground">Thư mục publish</label>
													<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.publishDir}</p>
												</div>
											)}
											{application.deployConfig.rootDir && (
												<div>
													<label className="text-sm font-medium text-muted-foreground">Thư mục gốc</label>
													<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.rootDir}</p>
												</div>
											)}
											{application.deployConfig.healthCheckPath && (
												<div>
													<label className="text-sm font-medium text-muted-foreground">Đường dẫn kiểm tra sức khỏe</label>
													<p className="mt-1 text-sm font-mono bg-muted p-2 rounded">{application.deployConfig.healthCheckPath}</p>
												</div>
											)}
										</div>
										{application.deployConfig.environmentVars && (
											<div>
												<label className="text-sm font-medium text-muted-foreground">Biến môi trường</label>
												<div className="mt-2 space-y-2">
													{(() => {
														try {
															const envVars = JSON.parse(application.deployConfig.environmentVars);
															const envArray = Array.isArray(envVars) 
																? envVars 
																: Object.entries(envVars).map(([key, value]) => ({ key, value }));
															
															return envArray.length > 0 ? (
																envArray.map((envVar: any, index: number) => (
																	<div key={index} className="flex gap-2">
																		<input
																			type="text"
																			value={envVar.key || ''}
																			disabled
																			className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-md text-muted-foreground"
																		/>
																		<input
																			type="text"
																			value={envVar.value || ''}
																			disabled
																			className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-md text-muted-foreground"
																		/>
																	</div>
																))
															) : (
																<p className="text-sm text-muted-foreground">Không có biến môi trường nào</p>
															);
														} catch (error) {
															console.error("Error parsing environment variables:", error);
															return <p className="text-sm text-red-500">Lỗi khi đọc biến môi trường</p>;
														}
													})()}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							)}
						</div>

						<div className="space-y-6">
						<AppControlActions 
							appId={appId} 
							containerStatus={containerStatus}
							onActionComplete={async () => {
								ApplicationService.getApplication(appId).then(setApplication);
								setTimeout(async () => {
									try {
										const metrics = await AppMonitoringService.getAppMetrics(appId);
										setContainerStatus(metrics.status);
									} catch (err) {
										console.error("Error refreshing container status:", err);
									}
								}, 2000);
							}}
						/>
						</div>
					</div>
				</TabsContent>

				{/* Metrics Tab */}
				<TabsContent value="metrics" className="space-y-6" forceMount hidden={activeTab !== "metrics"}>
					{application && ["deploying", "in_progress", "pending"].includes(application.status.toLowerCase()) ? (
						<Card>
							<CardContent className="py-12">
								<div className="text-center">
									<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
										<Activity className="h-6 w-6 text-blue-600 animate-pulse" />
									</div>
									<h3 className="text-lg font-semibold mb-2">Ứng dụng đang được triển khai</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Dữ liệu hiệu suất sẽ khả dụng sau khi quá trình triển khai hoàn tất.
									</p>
									<Badge className="bg-blue-100 text-blue-800">
										{translateStatus(application.status)}
									</Badge>
								</div>
							</CardContent>
						</Card>
					) : (
						<AppMetricsChartCard appId={appId} />
					)}
				</TabsContent>

				{/* Runtime Logs Tab */}
				<TabsContent value="logs" className="space-y-6" forceMount hidden={activeTab !== "logs"}>
					{application && ["deploying", "in_progress", "pending"].includes(application.status.toLowerCase()) ? (
						<Card>
							<CardContent className="py-12">
								<div className="text-center">
									<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
										<Terminal className="h-6 w-6 text-blue-600 animate-pulse" />
									</div>
									<h3 className="text-lg font-semibold mb-2">Ứng dụng đang được triển khai</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Nhật ký thời gian thực sẽ khả dụng sau khi container được khởi động.
									</p>
									<Badge className="bg-blue-100 text-blue-800">
										{translateStatus(application.status)}
									</Badge>
								</div>
							</CardContent>
						</Card>
					) : (
						<AppLogsViewer appId={appId} maxLines={500} />
					)}
				</TabsContent>

				{/* Build Logs Tab */}
				<TabsContent value="build-logs" className="space-y-6" forceMount hidden={activeTab !== "build-logs"}>
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Nhật ký build</CardTitle>
									<CardDescription>
										Nhật ký build thời gian thực từ Jenkins
										{isConnected && (
											<span className="ml-2 inline-flex items-center gap-1">
												<span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
												<span className="text-xs text-green-600">Đang phát</span>
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
										<p className="text-xs">Đang tải nhật ký...</p>
									</div>
								</div>
							) : sortedLogs.length === 0 ? (
								<div className="bg-black text-gray-500 p-4 rounded-lg font-mono text-sm h-64 flex items-center justify-center">
									<p>Chưa có nhật ký build. Nhật ký sẽ xuất hiện ở đây khi build được kích hoạt.</p>
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
				</TabsContent>

				{/* History Tab */}
				<TabsContent value="history" className="space-y-6" forceMount hidden={activeTab !== "history"}>
					<DeploymentHistoryTab appId={appId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}