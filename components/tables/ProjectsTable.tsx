"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, List, Grid3X3, Play, Pause, AlertCircle } from "lucide-react";
import api from "@/services/api";

type Project = {
	id: string;
	name: string;
	status: string;
	runtime: string;
	region: string;
	deployedAt: string;
};

export default function ProjectsTable() {
	const [query, setQuery] = useState("");
	const [view, setView] = useState<"list" | "grid">("list");
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				// TODO: Implement API endpoint for projects
				// const response = await api.get("/v1/projects");
				// setProjects(response.data);
				
				// For now, show fix data for testing
				setProjects([
					{
						id: "proj_1",
						name: "my-react-app",
						status: "running",
						runtime: "Node.js 18",
						region: "us-east-1",
						deployedAt: "2024-01-20T10:30:00Z"
					},
					{
						id: "proj_2", 
						name: "api-service",
						status: "stopped",
						runtime: "Python 3.11",
						region: "us-west-2",
						deployedAt: "2024-01-19T15:45:00Z"
					},
					{
						id: "proj_3",
						name: "frontend-dashboard",
						status: "running", 
						runtime: "Next.js 14",
						region: "eu-west-1",
						deployedAt: "2024-01-18T09:20:00Z"
					}
				]);
			} catch (error) {
				console.error("Error fetching projects:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProjects();
	}, []);

	return (
		<div className="grid gap-4">
			{/* Toolbar */}
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input 
							placeholder="Search projects..." 
							value={query} 
							onChange={(e) => setQuery(e.target.value)}
							className="pl-10 w-64"
						/>
					</div>
					<Select defaultValue="all">
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="running">Running</SelectItem>
							<SelectItem value="error">Error</SelectItem>
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
						List
					</Button>
					<Button 
						variant={view === "grid" ? "default" : "outline"} 
						size="sm"
						onClick={() => setView("grid")}
						className="gap-2"
					>
						<Grid3X3 className="h-4 w-4" />
						Grid
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
			) : projects.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
						<p className="text-muted-foreground text-center mb-4">
							Bạn chưa có dự án nào được triển khai. Hãy tạo dự án đầu tiên của bạn!
						</p>
						<Button>
							<Play className="h-4 w-4 mr-2" />
							Tạo dự án mới
						</Button>
					</CardContent>
				</Card>
			) : view === "list" ? (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Service name</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Runtime</TableHead>
								<TableHead>Region</TableHead>
								<TableHead>Deployed</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{projects.map((project) => (
								<TableRow key={project.id}>
									<TableCell className="font-medium">{project.name}</TableCell>
									<TableCell>
										<Badge variant="secondary" className="gap-1">
											<Pause className="h-3 w-3" />
											{project.status}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{project.runtime}</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">{project.region}</TableCell>
									<TableCell className="text-muted-foreground">{project.deployedAt}</TableCell>
									<TableCell>
										<Button variant="outline" size="sm">
											<Play className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<Card key={project.id} className="group hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">{project.name}</CardTitle>
									<Badge variant="secondary" className="gap-1">
										<Pause className="h-3 w-3" />
										{project.status}
									</Badge>
								</div>
								<CardDescription className="flex items-center gap-2">
									<Badge variant="outline" className="text-xs">{project.runtime}</Badge>
									<span className="text-xs text-muted-foreground">{project.region}</span>
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
									<Play className="h-4 w-4 mr-2" />
									Deploy
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
