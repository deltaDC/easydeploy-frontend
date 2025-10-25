"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ErrorAlert } from "@/components/ui/error-alert";
import { GithubService } from "@/services/github.service";

export default function LoginPage() {
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<{ message: string; status?: number } | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await login(formData.email, formData.password);
			// Redirect sẽ được xử lý trong useAuth hook
		} catch (err: any) {
			setError({ 
				message: err.message || "Đăng nhập thất bại",
				status: err.status 
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleGitHubLogin = async () => {
		try {
			setIsLoading(true);
			setError(null);
			
			const githubUrl = await GithubService.getOAuthUrl();
			window.location.href = githubUrl;
		} catch (err: any) {
			setError({ 
				message: err.message || "Không thể kết nối với GitHub",
				status: err.status 
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-4">
						<svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold tracking-tight">Đăng nhập</h1>
					<p className="mt-2 text-sm text-muted-foreground">Chào mừng trở lại EasyDeploy</p>
				</div>

				<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-2xl text-center font-semibold">Đăng nhập tài khoản</CardTitle>
						<CardDescription className="text-center text-muted-foreground">
							Nhập email và mật khẩu để đăng nhập
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="your@email.com"
									value={formData.email}
									onChange={handleInputChange}
									required
									disabled={isLoading}
									className="h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="Nhập mật khẩu"
									value={formData.password}
									onChange={handleInputChange}
									required
									disabled={isLoading}
									className="h-11"
								/>
							</div>
							{error && (
								<ErrorAlert 
									error={error} 
									onRetry={() => setError(null)}
								/>
							)}
							<Button type="submit" className="w-full h-11" disabled={isLoading}>
								{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4 pt-6">
						<div className="relative w-full">
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-muted-foreground">Hoặc tiếp tục với</span>
							</div>
						</div>
						<Button 
							variant="outline" 
							className="w-full h-11" 
							onClick={handleGitHubLogin}
							disabled={isLoading}
						>
							<Github className="mr-2 h-4 w-4" />
							{isLoading ? "Đang kết nối..." : "Đăng nhập với GitHub"}
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Chưa có tài khoản?{" "}
							<Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
								Đăng ký ngay
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
