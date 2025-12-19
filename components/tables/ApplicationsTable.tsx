"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
	Pagination, 
	PaginationContent, 
	PaginationItem, 
	PaginationLink, 
	PaginationNext, 
	PaginationPrevious,
	PaginationEllipsis 
} from "@/components/ui/pagination";
import { Search, List, Grid3X3, Play, Pause, AlertCircle, View, ExternalLink, FileCode, Server, Settings, Globe, RefreshCw, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/apps/EmptyState";
import ApplicationService from "@/services/application.service";
import { SortDirection } from "@/types/enum/sort-direction.enum";
import { 
	Application, 
	ApplicationListRequest, 
	PageInfo,
	DEFAULT_PAGEABLE_REQUEST 
} from "@/types/application.type";
import { formatDateDDMMYYYYHHMMSS } from "@/utils/date";
import Link from "next/link";
import { translateStatus } from "@/lib/status-translations";

export default function ApplicationsTable() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [view, setView] = useState<"list" | "grid">("list");
	const [applications, setApplications] = useState<Application[]>([]);
	const [pageInfo, setPageInfo] = useState<PageInfo>({
		size: 10,
		number: 0,
		totalElements: 0,
		totalPages: 0
	});
	const [isLoading, setIsLoading] = useState(true);
	const [paginationRequest, setPaginationRequest] = useState<ApplicationListRequest>({
		...DEFAULT_PAGEABLE_REQUEST,
		page: 0,
		size: 10,
		sortBy: "createdAt",
		sortDirection: SortDirection.DESC,
		name: "",
		status: undefined
	});

	const fetchApplications = async (request: ApplicationListRequest) => {
		try {
			setIsLoading(true);
			const response = await ApplicationService.getApplications(request);
			setApplications(response.content);
			setPageInfo(response.page);
		} catch (error) {
			console.error("Error fetching applications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchApplications(paginationRequest);
	}, [paginationRequest]);

	
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setPaginationRequest(prev => ({
				...prev,
				name: query.trim() || undefined,
				page: 0 
			}));
		}, 500); 

		return () => clearTimeout(timeoutId);
	}, [query]);

	
	useEffect(() => {
		setPaginationRequest(prev => ({
			...prev,
			status: statusFilter === "all" ? undefined : statusFilter as any,
			page: 0 
		}));
	}, [statusFilter]);

	const handlePageChange = (page: number) => {
		setPaginationRequest(prev => ({
			...prev,
			page
		}));
	};

	const handleSizeChange = (size: number) => {
		setPaginationRequest(prev => ({
			...prev,
			size,
			page: 0 
		}));
	};

	return (
		<div className="grid gap-4">
			{/* Toolbar */}
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 z-10" strokeWidth={1.5} />
						<Input 
							placeholder="Tìm kiếm ứng dụng..." 
							value={query} 
							onChange={(e) => setQuery(e.target.value)}
							className="pl-11 pr-4 h-11 w-64 rounded-full border-0 bg-white/60 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 focus:bg-white/80 transition-all"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả</SelectItem>
							<SelectItem value="SUCCESS">Thành công</SelectItem>
							<SelectItem value="FAILED">Thất bại</SelectItem>
							<SelectItem value="PENDING">Chờ xử lý</SelectItem>
							<SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<Button 
						variant={view === "list" ? "default" : "outline"} 
						size="sm"
						onClick={() => setView("list")}
						className="gap-2"
					>
						<List className="h-4 w-4" />
						Danh sách
					</Button>
					<Button 
						variant={view === "grid" ? "default" : "outline"} 
						size="sm"
						onClick={() => setView("grid")}
						className="gap-2"
					>
						<Grid3X3 className="h-4 w-4" />
						Lưới
					</Button>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Đang tải dự án...</p>
					</div>
				</div>
			) : applications.length === 0 ? (
				<EmptyState />
			) : view === "list" ? (
				<Card className="bg-white/60 backdrop-blur-xl border-0 rounded-3xl shadow-inner-glow-soft overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="border-b border-misty-grey/10 hover:bg-transparent">
								<TableHead className="text-charcoal/70 font-medium py-4">Tên ứng dụng</TableHead>
								<TableHead className="text-charcoal/70 font-medium py-4">Trạng thái</TableHead>
								<TableHead className="text-charcoal/70 font-medium py-4">URL</TableHead>
								<TableHead className="text-charcoal/70 font-medium py-4">Ngày tạo</TableHead>
								<TableHead className="w-[140px] text-charcoal/70 font-medium py-4">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{applications.map((application) => {
								const isRunning = application.status === 'SUCCESS';
								return (
									<TableRow 
										key={application.id} 
										className="border-0 hover:bg-misty-sage/5 transition-colors duration-200 group"
									>
										<TableCell className="font-medium py-5">
											<Link href={`/apps/${application.id}`} className="text-charcoal hover:text-misty-sage transition-colors">
												{application.name}
											</Link>
										</TableCell>
										<TableCell className="py-5">
											<Badge 
												variant="secondary" 
												className={`gap-1.5 border-0 ${
													isRunning 
														? 'bg-emerald-100/80 text-emerald-700' 
														: 'bg-misty-sage/10 text-charcoal'
												}`}
											>
												{isRunning ? (
													<>
														<div className="relative">
															<div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping-slow opacity-75" />
															<div className="relative h-2 w-2 rounded-full bg-emerald-500" />
														</div>
														<span>Đang chạy</span>
													</>
												) : (
													<>
														<Pause className="h-3 w-3" strokeWidth={1.5} />
														{translateStatus(application.status)}
													</>
												)}
											</Badge>
										</TableCell>
										<TableCell className="py-5">
											{application.publicUrl ? (
												<a
													href={application.publicUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-charcoal/70 hover:text-misty-sage flex items-center gap-1 transition-colors"
												>
													<span className="truncate max-w-[200px]">{application.publicUrl}</span>
													<ExternalLink className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
												</a>
											) : (
												<span className="text-charcoal/40">—</span>
											)}
										</TableCell>
										<TableCell className="text-charcoal/60 py-5">{formatDateDDMMYYYYHHMMSS(application.createdAt)}</TableCell>
										<TableCell className="py-5">
											<div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
												<Button 
													variant="ghost" 
													size="sm" 
													className="h-8 w-8 p-0 text-charcoal/60 hover:text-charcoal hover:bg-misty-sage/10 rounded-lg" 
													asChild
													title="Xem Logs"
												>
													<Link href={`/apps/${application.id}/log`}>
														<FileText className="h-4 w-4" strokeWidth={1.5} />
													</Link>
												</Button>
												<Button 
													variant="ghost" 
													size="sm" 
													className="h-8 w-8 p-0 text-charcoal/60 hover:text-charcoal hover:bg-misty-sage/10 rounded-lg" 
													asChild
													title="Cài đặt"
												>
													<Link href={`/apps/${application.id}`}>
														<Settings className="h-4 w-4" strokeWidth={1.5} />
													</Link>
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{applications.map((application, index) => {
						// Detect framework from name (simple heuristic)
						const getFrameworkIcon = (name: string) => {
							const lowerName = name.toLowerCase();
							if (lowerName.includes('next') || lowerName.includes('react')) {
								return { icon: FileCode, color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
							}
							if (lowerName.includes('nest') || lowerName.includes('express')) {
								return { icon: Server, color: 'text-red-500', bgColor: 'bg-red-500/10' };
							}
							return { icon: FileCode, color: 'text-misty-sage', bgColor: 'bg-misty-sage/10' };
						};

						const framework = getFrameworkIcon(application.name);
						const FrameworkIcon = framework.icon;
						const isRunning = application.status === 'SUCCESS';

						return (
							<motion.div
								key={application.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="group bg-white/60 backdrop-blur-xl border-0 rounded-3xl shadow-inner-glow-soft relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
									{/* Shimmer effect when loading */}
									{isLoading && (
										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
									)}

									<CardHeader className="pb-4 px-6 pt-6">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-3 flex-1 min-w-0">
												{/* Framework Icon with 3D effect */}
												<div className={`h-12 w-12 rounded-xl ${framework.bgColor} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
													<FrameworkIcon className={`h-6 w-6 ${framework.color}`} strokeWidth={1.5} />
												</div>
												<div className="flex-1 min-w-0">
													<CardTitle className="text-lg font-semibold text-charcoal truncate">
														<Link href={`/apps/${application.id}`} className="hover:text-misty-sage transition-colors">
															{application.name}
														</Link>
													</CardTitle>
													<p className="text-xs text-misty-sage font-medium mt-1">ID: {application.id}</p>
												</div>
											</div>
											{/* Running status with ping animation */}
											{isRunning && (
												<div className="relative flex-shrink-0">
													<div className="absolute inset-0 flex items-center justify-center">
														<div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping-slow" />
													</div>
													<div className="relative h-3 w-3 rounded-full bg-emerald-500" />
												</div>
											)}
										</div>
										<CardDescription className="text-xs text-charcoal/60 space-y-1">
											{application.publicUrl ? (
												<a
													href={application.publicUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 hover:text-misty-sage transition-colors"
												>
													<Globe className="h-3 w-3" strokeWidth={1.5} />
													<span className="truncate">{application.publicUrl}</span>
													<ExternalLink className="h-3 w-3 flex-shrink-0" />
												</a>
											) : (
												<span>URL: N/A</span>
											)}
											<div className="text-xs text-charcoal/60">
												{formatDateDDMMYYYYHHMMSS(application.createdAt)}
											</div>
										</CardDescription>
									</CardHeader>
								<CardContent className="px-6 pb-6 pt-0">
									{/* Status badge - always visible */}
									<Badge variant="secondary" className="gap-1.5 bg-misty-sage/10 text-charcoal border-0 mb-3">
										{isRunning ? (
											<>
												<div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
												<span className="text-xs">Đang chạy</span>
											</>
										) : (
											<>
												<Pause className="h-3 w-3" strokeWidth={1.5} />
												<span className="text-xs">{translateStatus(application.status)}</span>
											</>
										)}
									</Badge>

									{/* Hover Overlay with Quick Actions */}
									<div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl flex items-end justify-center pb-6">
										<div className="flex items-center gap-2">
											<Button 
												variant="secondary" 
												size="sm" 
												className="h-9 px-3 bg-white/90 backdrop-blur-sm hover:bg-white text-charcoal rounded-xl shadow-lg" 
												asChild
												title="Xem Logs"
											>
												<Link href={`/apps/${application.id}/log`}>
													<FileText className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
													<span className="text-xs font-medium">Logs</span>
												</Link>
											</Button>
											<Button 
												variant="secondary" 
												size="sm" 
												className="h-9 px-3 bg-white/90 backdrop-blur-sm hover:bg-white text-charcoal rounded-xl shadow-lg" 
												asChild
												title="Redeploy"
											>
												<Link href={`/apps/${application.id}`}>
													<RefreshCw className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
													<span className="text-xs font-medium">Redeploy</span>
												</Link>
											</Button>
											<Button 
												variant="secondary" 
												size="sm" 
												className="h-9 px-3 bg-white/90 backdrop-blur-sm hover:bg-white text-charcoal rounded-xl shadow-lg" 
												asChild
												title="Cài đặt"
											>
												<Link href={`/apps/${application.id}`}>
													<Settings className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
													<span className="text-xs font-medium">Cài đặt</span>
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}

			{/* Pagination */}
			{applications.length > 0 && (
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							Hiển thị {pageInfo.number * pageInfo.size + 1} đến {Math.min((pageInfo.number + 1) * pageInfo.size, pageInfo.totalElements)} trong tổng số {pageInfo.totalElements} kết quả
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Số mục mỗi trang:</span>
							<Select value={paginationRequest.size.toString()} onValueChange={(value) => handleSizeChange(parseInt(value))}>
								<SelectTrigger className="w-20">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="100">100</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					
					{pageInfo.totalPages > 1 && (
						<div className="flex justify-center">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious 
											href="#"
											size="default"
											onClick={(e) => {
												e.preventDefault();
												if (pageInfo.number > 0) {
													handlePageChange(pageInfo.number - 1);
												}
											}}
											className={pageInfo.number === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>
									
									{/* Page numbers */}
									{Array.from({ length: Math.min(5, pageInfo.totalPages) }, (_, i) => {
										let pageNumber;
										if (pageInfo.totalPages <= 5) {
											pageNumber = i;
										} else if (pageInfo.number <= 2) {
											pageNumber = i;
										} else if (pageInfo.number >= pageInfo.totalPages - 3) {
											pageNumber = pageInfo.totalPages - 5 + i;
										} else {
											pageNumber = pageInfo.number - 2 + i;
										}

										return (
											<PaginationItem key={pageNumber}>
												<PaginationLink
													href="#"
													size="icon"
													onClick={(e) => {
														e.preventDefault();
														handlePageChange(pageNumber);
													}}
													isActive={pageNumber === pageInfo.number}
													className="cursor-pointer"
												>
													{pageNumber + 1}
												</PaginationLink>
											</PaginationItem>
										);
									})}

									{pageInfo.totalPages > 5 && pageInfo.number < pageInfo.totalPages - 3 && (
										<PaginationItem>
											<PaginationEllipsis />
										</PaginationItem>
									)}

									<PaginationItem>
										<PaginationNext 
											href="#"
											size="default"
											onClick={(e) => {
												e.preventDefault();
												if (pageInfo.number < pageInfo.totalPages - 1) {
													handlePageChange(pageInfo.number + 1);
												}
											}}
											className={pageInfo.number >= pageInfo.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
