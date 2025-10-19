import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Container, Monitor, Users, Github } from "lucide-react";

export default function LandingPage() {
	return (
		<section className="py-12">
			<div className="container-page grid gap-12">
				<header className="grid gap-6 text-center">
					<div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
						<Zap className="h-8 w-8 text-primary-foreground" />
					</div>
					<h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl leading-tight">
						Triển khai web app nhanh chóng với{" "}
						<span className="text-primary">EasyDeploy</span>
					</h1>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Kết nối GitHub hoặc dùng Docker image. Hệ thống tự động build & deploy và trả về URL public.
					</p>
					<div className="flex items-center justify-center gap-4">
						<Button asChild size="lg" className="gap-2">
							<Link href="/login">
								Bắt đầu miễn phí
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<Link href="/apps">Xem Dashboard</Link>
						</Button>
					</div>
				</header>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card className="group hover:shadow-lg transition-all duration-300">
						<CardHeader className="pb-4">
							<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
								<Zap className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-xl">Tự động hóa CI/CD</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								Clone → Build → Deploy chỉ với vài cú click.
							</CardDescription>
						</CardContent>
					</Card>
					
					<Card className="group hover:shadow-lg transition-all duration-300">
						<CardHeader className="pb-4">
							<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
								<Container className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-xl">Hỗ trợ Docker</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								Triển khai bằng Docker image hoặc từ source.
							</CardDescription>
						</CardContent>
					</Card>
					
					<Card className="group hover:shadow-lg transition-all duration-300">
						<CardHeader className="pb-4">
							<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
								<Monitor className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-xl">Giám sát</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								Trạng thái, log realtime, cảnh báo downtime.
							</CardDescription>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card className="group hover:shadow-lg transition-all duration-300">
						<CardHeader className="pb-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
									<Users className="h-5 w-5 text-primary" />
								</div>
								<Badge variant="secondary">Dành cho</Badge>
							</div>
							<CardTitle className="text-xl">Sinh viên, freelancer, startup</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								Không cần DevOps nâng cao. Tập trung vào sản phẩm, để EasyDeploy lo phần deploy.
							</CardDescription>
						</CardContent>
					</Card>
					
					<Card className="group hover:shadow-lg transition-all duration-300">
						<CardHeader className="pb-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
									<Github className="h-5 w-5 text-primary" />
								</div>
								<Badge variant="secondary">Tích hợp</Badge>
							</div>
							<CardTitle className="text-xl">Kết nối GitHub trong 1 phút</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								Authorize GitHub, chọn repository, bấm Deploy. Có thể tự động redeploy khi có commit mới.
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
