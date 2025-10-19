"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/services/api";
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
	TrendingDown
} from "lucide-react";

export default function AdminDashboard() {
	const { user, isAdmin } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [stats, setStats] = useState({
		totalUsers: 0,
		activeUsers: 0,
		totalApps: 0,
		runningApps: 0,
		totalDeployments: 0,
		successfulDeployments: 0,
		systemUptime: 0,
		avgResponseTime: 0,
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


	// Fetch admin dashboard data
	useEffect(() => {
		const fetchAdminData = async () => {
			try {
				// TODO: Implement these API endpoints in backend
				// const statsResponse = await api.get("/v1/admin/stats");
				// const usersResponse = await api.get("/v1/admin/users");
				// const metricsResponse = await api.get("/v1/admin/metrics");

				// For now, show fix data for testing
				setStats({
					totalUsers: 156,
					activeUsers: 142,
					totalApps: 89,
					runningApps: 76,
					totalDeployments: 234,
					successfulDeployments: 221,
					systemUptime: 99.8,
					avgResponseTime: 145,
				});
				
				setRecentUsers([
					{
						id: "user_1",
						email: "john.doe@example.com",
						roles: new Set(["DEVELOPER"]),
						status: "active",
						createdAt: "2024-01-15T10:30:00Z",
						lastLoginAt: "2024-01-20T09:15:00Z",
						appsCount: 3
					},
					{
						id: "user_2", 
						email: "jane.smith@example.com",
						roles: new Set(["DEVELOPER"]),
						status: "active",
						createdAt: "2024-01-18T14:20:00Z",
						lastLoginAt: "2024-01-20T08:45:00Z",
						appsCount: 2
					},
					{
						id: "user_3",
						email: "admin@example.com", 
						roles: new Set(["ADMIN"]),
						status: "active",
						createdAt: "2024-01-10T09:00:00Z",
						lastLoginAt: "2024-01-20T10:30:00Z",
						appsCount: 0
					}
				]);
				
				setSystemMetrics([
					{
						name: "CPU Usage",
						value: "45%",
						trend: "up",
						change: "+2.3%"
					},
					{
						name: "Memory Usage", 
						value: "67%",
						trend: "down",
						change: "-1.2%"
					},
					{
						name: "Disk Usage",
						value: "23%", 
						trend: "up",
						change: "+0.8%"
					},
					{
						name: "Network I/O",
						value: "234 MB/s",
						trend: "up", 
						change: "+12.5%"
					}
				]);
			} catch (error) {
				console.error("Error fetching admin data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (isAdmin()) {
			fetchAdminData();
		}
	}, [isAdmin]);

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
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">
								<span className="text-green-600">+12%</span> so với tháng trước
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Ứng dụng đang chạy</CardTitle>
							<Server className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.runningApps.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">
								<span className="text-green-600">+8%</span> so với tháng trước
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
								<span className="text-green-600">+2.1%</span> so với tháng trước
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Uptime hệ thống</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.systemUptime}%</div>
							<p className="text-xs text-muted-foreground">
								<span className="text-green-600">+0.1%</span> so với tháng trước
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
						<CardDescription>Danh sách và quản lý tài khoản người dùng</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4 mb-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Tìm kiếm người dùng..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả</SelectItem>
									<SelectItem value="active">Hoạt động</SelectItem>
									<SelectItem value="suspended">Bị khóa</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Người dùng</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Số ứng dụng</TableHead>
									<TableHead>Đăng nhập cuối</TableHead>
									<TableHead className="w-[100px]">Thao tác</TableHead>
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
											<Badge variant={isAdmin() ? 'default' : 'secondary'}>
												{isAdmin() ? 'Quản trị viên' : 'Người dùng'}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
												{user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
											</Badge>
										</TableCell>
										<TableCell>{user.appsCount}</TableCell>
										<TableCell>
											{new Date(user.lastLoginAt).toLocaleDateString('vi-VN')}
										</TableCell>
										<TableCell>
											<Button variant="outline" size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
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
