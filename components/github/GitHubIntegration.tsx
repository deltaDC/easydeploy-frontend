"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Link, Unlink, ExternalLink } from "lucide-react";
import { GithubService } from "@/services/github.service";
import { useAuthStore } from "@/store/useAuthStore";
import { ErrorAlert } from "@/components/ui/error-alert";

export default function GitHubIntegration() {
	const { user, setUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<{ message: string; status?: number } | null>(null);

	const handleLinkGitHub = async () => {
		try {
			setIsLoading(true);
			setError(null);
			
			const githubUrl = await GithubService.getLinkUrl();
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

	const handleDisconnectGitHub = async () => {
		try {
			setIsLoading(true);
			setError(null);
			
			await GithubService.disconnectGithub();
			
			// Cập nhật user state
			setUser({
				...user!,
				githubUsername: undefined,
				avatarUrl: undefined,
			});
			
		} catch (err: any) {
			setError({ 
				message: err.message || "Không thể ngắt kết nối GitHub",
				status: err.status 
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Github className="h-5 w-5" />
					GitHub Integration
				</CardTitle>
				<CardDescription>
					Liên kết tài khoản GitHub để import và deploy projects
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<ErrorAlert 
						error={error} 
						onRetry={() => setError(null)}
					/>
				)}

				{user?.githubUsername ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
									{user.avatarUrl ? (
										<img 
											src={user.avatarUrl} 
											alt="GitHub Avatar" 
											className="h-10 w-10 rounded-full"
										/>
									) : (
										<Github className="h-5 w-5 text-gray-600" />
									)}
								</div>
								<div>
									<p className="font-medium text-green-800">
										@{user.githubUsername}
									</p>
									<p className="text-sm text-green-600">
										Đã liên kết với GitHub
									</p>
								</div>
							</div>
							<Badge variant="secondary" className="bg-green-100 text-green-800">
								<Link className="h-3 w-3 mr-1" />
								Connected
							</Badge>
						</div>

						<div className="flex gap-2">
							<Button 
								variant="outline" 
								size="sm"
								onClick={() => window.open(`https://github.com/${user.githubUsername}`, '_blank')}
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								Xem Profile
							</Button>
							<Button 
								variant="destructive" 
								size="sm"
								onClick={handleDisconnectGitHub}
								disabled={isLoading}
							>
								<Unlink className="h-4 w-4 mr-2" />
								{isLoading ? "Đang ngắt kết nối..." : "Ngắt kết nối"}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 border-gray-200">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
									<Github className="h-5 w-5 text-gray-600" />
								</div>
								<div>
									<p className="font-medium text-gray-800">
										Chưa liên kết GitHub
									</p>
									<p className="text-sm text-gray-600">
										Liên kết để import và deploy projects
									</p>
								</div>
							</div>
							<Badge variant="outline" className="text-gray-600">
								<Unlink className="h-3 w-3 mr-1" />
								Not Connected
							</Badge>
						</div>

						<Button 
							onClick={handleLinkGitHub}
							disabled={isLoading}
							className="w-full"
						>
							<Github className="h-4 w-4 mr-2" />
							{isLoading ? "Đang kết nối..." : "Liên kết với GitHub"}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
