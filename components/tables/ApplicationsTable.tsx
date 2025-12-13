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
import { Search, List, Grid3X3, Play, Pause, AlertCircle, View, ExternalLink } from "lucide-react";
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
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input 
							placeholder="Tìm kiếm ứng dụng..." 
							value={query} 
							onChange={(e) => setQuery(e.target.value)}
							className="pl-10 w-64"
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
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
						<p className="text-muted-foreground text-center mb-4">
							Bạn chưa có dự án nào được triển khai. Hãy tạo dự án đầu tiên của bạn!
						</p>
						<Button asChild>
							<Link href="/apps/new">
								<Play className="h-4 w-4 mr-2" />
								Tạo dự án mới
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : view === "list" ? (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tên ứng dụng</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead>URL</TableHead>
								<TableHead>Ngày tạo</TableHead>
								<TableHead className="w-[100px]">Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{applications.map((application) => (
								<TableRow key={application.id}>
									<TableCell className="font-medium">
										<Link href={`/apps/${application.id}`} className="text-primary hover:underline">
											{application.name}
										</Link>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" className="gap-1">
											<Pause className="h-3 w-3" />
											{translateStatus(application.status)}
										</Badge>
									</TableCell>
									<TableCell>
										{application.publicUrl ? (
											<a
												href={application.publicUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline flex items-center gap-1"
											>
												{application.publicUrl}
												<ExternalLink className="h-3 w-3" />
											</a>
										) : (
											<span className="text-muted-foreground">N/A</span>
										)}
									</TableCell>
									<TableCell className="text-muted-foreground">{formatDateDDMMYYYYHHMMSS(application.createdAt)}</TableCell>
									<TableCell>
										<Button variant="outline" size="sm" asChild>
											<Link href={`/apps/${application.id}`} className="inline-flex items-center">
												<View className="h-4 w-4" />
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{applications.map((application) => (
						<Card key={application.id} className="group hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">
										<Link href={`/apps/${application.id}`} className="text-primary hover:underline">
											{application.name}
										</Link>
									</CardTitle>
									<Badge variant="secondary" className="gap-1">
										<Pause className="h-3 w-3" />
										{translateStatus(application.status)}
									</Badge>
								</div>
								<CardDescription className="flex items-center gap-2">
									{application.publicUrl ? (
										<a
											href={application.publicUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-primary hover:underline flex items-center gap-1"
										>
											{application.publicUrl}
											<ExternalLink className="h-3 w-3" />
										</a>
									) : (
										<span className="text-xs text-muted-foreground">N/A</span>
									)}
									<span className="text-xs text-muted-foreground">{formatDateDDMMYYYYHHMMSS(application.createdAt)}</span>
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
									<Play className="h-4 w-4 mr-2" />
									Triển khai
								</Button>
							</CardContent>
						</Card>
					))}
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
