import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowRight, Zap, GitBranch, Activity, Plus } from "lucide-react";

export default function DashboardHome() {
	return (
		<div className="py-6">
			<div className="container-page grid gap-6">
				<PageHeader 
					title="Tổng quan" 
					description="Tình trạng hệ thống, tài nguyên sử dụng và dự án gần đây" 
					actions={
						<Button asChild className="gap-2">
							<Link href="/apps/new">
								<Plus className="h-4 w-4" />
								Deploy mới
							</Link>
						</Button>
					} 
				/>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					{/* Left column: Usage + Recent */}
					<div className="lg:col-span-4 grid gap-4">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg font-semibold flex items-center gap-2">
									<Activity className="h-5 w-5" />
									Usage (30 ngày)
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Data Transfer</span>
										<span className="font-medium">0 / 100 GB</span>
									</div>
									<Progress value={0} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Origin Transfer</span>
										<span className="font-medium">0 / 10 GB</span>
									</div>
									<Progress value={0} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Edge Requests</span>
										<span className="font-medium">0 / 1M</span>
									</div>
									<Progress value={0} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Edge CPU</span>
										<span className="font-medium">0 / 1h</span>
									</div>
									<Progress value={0} className="h-2" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg font-semibold flex items-center gap-2">
									<GitBranch className="h-5 w-5" />
									Recent Previews
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">Chưa có preview nào gần đây.</p>
							</CardContent>
						</Card>
					</div>

					{/* Right column: Projects */}
					<div className="lg:col-span-8 grid gap-4">
						<Card className="border-dashed">
							<CardContent className="pt-6">
								<div className="grid place-items-center py-8 text-center">
									<div className="space-y-4">
										<div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center">
											<Zap className="h-6 w-6 text-muted-foreground" />
										</div>
										<div className="space-y-2">
											<h3 className="text-lg font-semibold">Deploy dự án đầu tiên của bạn</h3>
											<p className="text-muted-foreground text-sm">Import từ Git provider hoặc chọn một template có sẵn.</p>
										</div>
										<div className="flex justify-center gap-3">
											<Button asChild>
												<Link href="/apps/new">Import Project</Link>
											</Button>
											<Button variant="outline">
												Next.js Boilerplate
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Card className="group hover:shadow-md transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg font-semibold">AI Chatbot</CardTitle>
									<CardDescription>Full-featured Next.js AI chatbot</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Status</span>
										<Badge variant="secondary">Not deployed</Badge>
									</div>
									<Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
										Deploy
									</Button>
								</CardContent>
							</Card>
							
							<Card className="group hover:shadow-md transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg font-semibold">Express.js</CardTitle>
									<CardDescription>Template Express trên EasyDeploy</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Status</span>
										<Badge variant="secondary">Not deployed</Badge>
									</div>
									<Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
										Deploy
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
