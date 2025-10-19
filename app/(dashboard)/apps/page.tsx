import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectsTable from "@/components/tables/ProjectsTable";
import { Plus, Lightbulb, Github, Container } from "lucide-react";

export default function AppsListPage() {
	return (
		<div className="grid gap-6">
			<PageHeader 
				title="Ứng dụng của bạn" 
				description="Quản lý, redeploy và xem log" 
				actions={
					<Button asChild className="gap-2">
						<Link href="/apps/new">
							<Plus className="h-4 w-4" />
							Deploy mới
						</Link>
					</Button>
				} 
			/>
			<ProjectsTable />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card className="border-dashed">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
								<Plus className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<CardTitle className="text-lg">Chưa có ứng dụng</CardTitle>
								<CardDescription>Bắt đầu bằng nút "Deploy mới"</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							Tạo ứng dụng đầu tiên của bạn để bắt đầu hành trình deploy.
						</p>
					</CardContent>
				</Card>
				
				<Card className="border-dashed">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
								<Lightbulb className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">Gợi ý</CardTitle>
								<CardDescription>Các cách deploy ứng dụng</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center gap-2">
							<Github className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Deploy qua GitHub repo</span>
						</div>
						<div className="flex items-center gap-2">
							<Container className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Deploy qua Docker image</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
