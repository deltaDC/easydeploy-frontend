"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import api from "@/services/api";
import { StatsService } from "@/services/stats.service";
import userManagementService from "@/services/user-management.service";
import { monitoringService } from "@/services/monitoring.service";
import { SortDirection } from "@/types/user-management";
import {
	Users,
	Activity,
	Server,
	Shield,
	Search,
	Filter,
	MoreHorizontal,
	Ban,
	CheckCircle,
	AlertCircle,
	TrendingUp,
	TrendingDown,
	ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
	const { user, isAdmin } = useAuth();
	const [mounted, setMounted] = useState(false);
	const [stats, setStats] = useState({
		totalUsers: 0,
		activeUsers: 0,
		totalApps: 0,
		runningApps: 0,
		totalDeployments: 0,
		successfulDeployments: 0,
		systemUptime: null as number | null,
		avgResponseTime: null as number | null,
		totalUsersChangePercent: undefined as number | undefined,
		runningAppsChangePercent: undefined as number | undefined,
		successRateChangePercent: undefined as number | undefined,
		systemUptimeChangePercent: undefined as number | undefined,
	});
	const [recentUsers, setRecentUsers] = useState<Array<{
		id: string;
		email: string;
		roles: Set<string>;
		status: string;
		createdAt: string;
		lastLoginAt: string;
		appsCount: number;
	}>>([]);
	const [systemMetrics, setSystemMetrics] = useState<Array<{
		name: string;
		value: string;
		trend: string;
		change: string;
	}>>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Handle client-side mounting
	useEffect(() => {
		setMounted(true);
	}, []);

	// Fetch admin dashboard data
	useEffect(() => {
		if (!mounted) return;

		const fetchAdminData = async () => {
			try {
				const startDate = new Date('2025-01-01').toISOString();
				const endDate = new Date().toISOString();
				const overviewResponse = await StatsService.getSystemOverview('year', startDate, endDate);
				const summary = overviewResponse.summary;

				setStats({
					totalUsers: summary.totalUsers,
					activeUsers: summary.activeUsers,
					totalApps: summary.totalApplications,
					runningApps: summary.runningApplications,
					totalDeployments: summary.totalDeployments,
					successfulDeployments: summary.successfulDeployments,
					systemUptime: summary.systemUptime ?? null,
					avgResponseTime: summary.avgResponseTime ?? null,
					totalUsersChangePercent: summary.totalUsersChangePercent,
					runningAppsChangePercent: summary.runningAppsChangePercent,
					successRateChangePercent: summary.successRateChangePercent,
					systemUptimeChangePercent: summary.systemUptimeChangePercent,
				});
				
				try {
					const prometheusMetrics = await monitoringService.getPrometheusMetrics();
					if (prometheusMetrics?.systemMetrics) {
						const sysMetrics = prometheusMetrics.systemMetrics;
						const jvmMetrics = prometheusMetrics.jvmMetrics;
						
						setSystemMetrics([
							{
								name: "CPU Usage",
								value: `${sysMetrics.processCpuUsage?.toFixed(1) || 0}%`,
								trend: sysMetrics.cpuTrend || "up",
								change: sysMetrics.cpuChange || "+0%"
							},
							{
								name: "Memory Usage", 
								value: `${jvmMetrics?.heapUsagePercent?.toFixed(1) || 0}%`,
								trend: sysMetrics.memoryTrend || "down",
								change: sysMetrics.memoryChange || "+0%"
							},
							{
								name: "Disk Usage",
								value: sysMetrics.diskUsage != null ? `${sysMetrics.diskUsage.toFixed(1)}%` : "N/A",
								trend: "up",
								change: "+0%"
							},
							{
								name: "Network I/O",
								value: sysMetrics.networkIO || "N/A",
								trend: "up", 
								change: "+0%"
							}
						]);
					} else {
						// Fallback to hardcoded values if metrics not available
						setSystemMetrics([
							{
								name: "CPU Usage",
								value: "N/A",
								trend: "up",
								change: "+0%"
							},
							{
								name: "Memory Usage", 
								value: "N/A",
								trend: "down",
								change: "+0%"
							},
							{
								name: "Disk Usage",
								value: "N/A", 
								trend: "up",
								change: "+0%"
							},
							{
								name: "Network I/O",
								value: "N/A",
								trend: "up", 
								change: "+0%"
							}
						]);
					}
				} catch (error) {
					console.error("Error fetching Prometheus metrics:", error);
					// Keep hardcoded values on error
					setSystemMetrics([
						{
							name: "CPU Usage",
							value: "N/A",
							trend: "up",
							change: "+0%"
						},
						{
							name: "Memory Usage", 
							value: "N/A",
							trend: "down",
							change: "+0%"
						},
						{
							name: "Disk Usage",
							value: "N/A", 
							trend: "up",
							change: "+0%"
						},
						{
							name: "Network I/O",
							value: "N/A",
							trend: "up", 
							change: "+0%"
						}
					]);
				}
				
				const usersResponse = await userManagementService.getAllUsers({
					page: 1,
					size: 5,
					sortBy: 'createdAt',
					direction: SortDirection.DESC,
				});

				const users = usersResponse.users.map((user) => ({
					id: user.id,
					email: user.email,
					roles: new Set(user.roles || []),
					status: user.status?.toLowerCase() || 'active',
					createdAt: user.createdAt || '',
					lastLoginAt: (user as any).lastLoginAt || user.createdAt || '',
					appsCount: (user as any).totalProjects ?? 0,
				}));
				
				users.sort((a, b) => {
					const dateA = new Date(a.lastLoginAt).getTime();
					const dateB = new Date(b.lastLoginAt).getTime();
					return dateB - dateA;
				});
				
				setRecentUsers(users.slice(0, 5));
			} catch (error) {
				console.error("Error fetching admin data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (isAdmin()) {
			fetchAdminData();
		} else {
			setIsLoading(false);
		}
	}, [mounted, isAdmin]);

	if (!isAdmin()) {
		return (
			<div className="flex items-center justify-center py-12">
				<Alert className="max-w-md">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới có thể xem.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Prevent hydration mismatch
	if (!mounted) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Đang tải dữ liệu...</p>
				</div>
			</div>
		);
	}

	const formatPercentageChange = (value: number | undefined): { text: string; color: string } => {
		if (value === null || value === undefined || isNaN(value)) {
			return { text: "+0%", color: "text-muted-foreground" };
		}
		const sign = value >= 0 ? "+" : "";
		const color = value >= 0 ? "text-green-600" : "text-red-600";
		return { text: `${sign}${value.toFixed(1)}%`, color };
	};

	return (
		<div className="py-6">
			<div className="container-page grid gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
							<Shield className="h-6 w-6" />
							Admin Dashboard
						</h1>
						<p className="text-muted-foreground">Quản lý hệ thống và người dùng</p>
					</div>
					<Badge variant="outline" className="gap-1">
						<Shield className="h-3 w-3" />
						Quản trị viên
					</Badge>
				</div>

				{/* System Overview */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Link href="/admin/users">
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									{(() => {
										const change = formatPercentageChange(stats.totalUsersChangePercent);
										return <span className={change.color}>{change.text}</span>;
									})()} so với tháng trước
									<ArrowRight className="h-3 w-3 ml-auto" />
								</p>
							</CardContent>
						</Card>
					</Link>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Ứng dụng đang chạy</CardTitle>
							<Server className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.runningApps.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">
								{(() => {
									const change = formatPercentageChange(stats.runningAppsChangePercent);
									return <span className={change.color}>{change.text}</span>;
								})()} so với tháng trước
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
							<Activity className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{((stats.successfulDeployments / stats.totalDeployments) * 100).toFixed(1)}%
							</div>
							<p className="text-xs text-muted-foreground">
								{(() => {
									const change = formatPercentageChange(stats.successRateChangePercent);
									return <span className={change.color}>{change.text}</span>;
								})()} so với tháng trước
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Uptime hệ thống</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.systemUptime != null ? `${stats.systemUptime}%` : "N/A"}
							</div>
							<p className="text-xs text-muted-foreground">
								{(() => {
									const change = formatPercentageChange(stats.systemUptimeChangePercent);
									return <span className={change.color}>{change.text}</span>;
								})()} so với tháng trước
							</p>
						</CardContent>
					</Card>
				</div>

				{/* System Metrics */}
				<Card>
					<CardHeader>
						<CardTitle>Hệ thống</CardTitle>
						<CardDescription>Thông số kỹ thuật và hiệu suất</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							{systemMetrics.map((metric) => (
								<div key={metric.name} className="p-4 border rounded-lg">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium">{metric.name}</span>
										{metric.trend === "up" ? (
											<TrendingUp className="h-4 w-4 text-green-600" />
										) : (
											<TrendingDown className="h-4 w-4 text-red-600" />
										)}
									</div>
									<div className="text-2xl font-bold">{metric.value}</div>
									<div className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
										{metric.change} so với giờ trước
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* User Management */}
				<Card>
					<CardHeader>
						<CardTitle>Quản lý người dùng</CardTitle>
						<CardDescription>5 người hoạt động gần nhất</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Người dùng</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Số ứng dụng</TableHead>
									<TableHead>Đăng nhập cuối</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div>
												<div className="font-medium">{user.email}</div>
												<div className="text-sm text-muted-foreground">{user.email}</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={user.roles.has('ADMIN') ? 'default' : 'secondary'}>
												{user.roles.has('ADMIN') ? 'Quản trị viên' : 'Người dùng'}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge 
												variant={user.status === 'active' ? 'default' : 'destructive'}
												className={user.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
											>
												{user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
											</Badge>
										</TableCell>
										<TableCell>{user.appsCount}</TableCell>
										<TableCell>
											{new Date(user.lastLoginAt).toLocaleDateString('vi-VN')}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
