"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Download, GitBranch, Star, Eye } from "lucide-react";
import { GithubService } from "@/services/github.service";
import { useAuthStore } from "@/store/useAuthStore";
import { ErrorAlert } from "@/components/ui/error-alert";

interface GitHubRepo {
	id: number;
	name: string;
	fullName: string;
	description: string;
	htmlUrl: string;
	cloneUrl: string;
	sshUrl: string;
	defaultBranch: string;
	isPrivate: boolean;
	isFork: boolean;
	language: string;
	stargazersCount: number;
	forksCount: number;
	updatedAt: string;
	createdAt: string;
}

export default function ImportProjectPage() {
	const { user } = useAuthStore();
	const [repos, setRepos] = useState<GitHubRepo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<{ message: string; status?: number } | null>(null);

	const connectGitHubApp = async () => {
		try {
			setIsLoading(true);
			const response = await GithubService.getAppInstallUrl();
			window.location.href = response.installUrl;
		} catch (err: any) {
			setError({ 
				message: err.message || "Không thể kết nối với GitHub App",
				status: err.status 
			});
		} finally {
			setIsLoading(false);
		}
	};

	const loadRepositories = async () => {
		try {
			setIsLoading(true);
			setError(null);
			
			try {
				const response = await GithubService.getAllUserRepositories();
				setRepos(response);
			} catch (appError) {
				console.warn("GitHub App repositories failed, trying OAuth:", appError);
				// Fallback về OAuth repositories
				const response = await GithubService.getRepositories();
				setRepos(response);
			}
		} catch (err: any) {
			setError({ 
				message: err.message || "Không thể tải danh sách repositories",
				status: err.status 
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleImportRepo = (repo: GitHubRepo) => {
		// TODO: Implement import repository logic
		console.log("Importing repo:", repo);
		// Redirect to new app creation with repo data
		window.location.href = `/apps/new?repo=${encodeURIComponent(JSON.stringify(repo))}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	if (!user?.githubUsername) {
		return (
			<div className="py-6">
				<div className="container-page">
					<div className="text-center py-12">
						<div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<Github className="h-8 w-8 text-gray-400" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Chưa liên kết GitHub
						</h2>
						<p className="text-gray-600 mb-6">
							Bạn cần liên kết tài khoản GitHub để import projects
						</p>
						<Button asChild>
							<a href="/profile">Liên kết GitHub</a>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-6">
			<div className="container-page">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Import Project</h1>
						<p className="text-muted-foreground">
							Chọn repository từ GitHub để deploy
						</p>
					</div>
					<div className="flex gap-4">
						<Button 
							onClick={loadRepositories}
							disabled={isLoading}
							className="gap-2"
						>
							<Github className="h-4 w-4" />
							{isLoading ? "Đang tải..." : "Tải repositories"}
						</Button>
						
						<Button 
							onClick={connectGitHubApp}
							disabled={isLoading}
							variant="outline"
							className="gap-2"
						>
							<Github className="h-4 w-4" />
							Connect GitHub App
						</Button>
					</div>
				</div>

				{error && (
					<ErrorAlert 
						error={error} 
						onRetry={() => setError(null)}
					/>
				)}

				{repos.length === 0 && !isLoading && !error && (
					<Card>
						<CardContent className="text-center py-12">
							<div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Download className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Chưa có repositories
							</h3>
							<p className="text-gray-600 mb-4">
								Nhấn &quot;Tải repositories&quot; để xem danh sách repositories từ GitHub
							</p>
						</CardContent>
					</Card>
				)}

				{isLoading && (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<div className="h-3 bg-gray-200 rounded"></div>
										<div className="h-3 bg-gray-200 rounded w-5/6"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{repos.length > 0 && (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{repos.map((repo) => (
							<Card key={repo.id} className="hover:shadow-lg transition-shadow">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<CardTitle className="text-lg truncate flex items-center gap-2">
												<Github className="h-4 w-4 text-gray-500" />
												{repo.name}
											</CardTitle>
											<CardDescription className="truncate">
												{repo.fullName}
											</CardDescription>
										</div>
										<div className="flex gap-1 ml-2">
											{repo.isPrivate && (
												<Badge variant="secondary" className="text-xs">
													Private
												</Badge>
											)}
											{repo.isFork && (
												<Badge variant="outline" className="text-xs">
													Fork
												</Badge>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{repo.description && (
										<p className="text-sm text-gray-600 line-clamp-2">
											{repo.description}
										</p>
									)}

									<div className="flex items-center gap-4 text-xs text-gray-500">
										{repo.language && (
											<span className="flex items-center gap-1">
												<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
												{repo.language}
											</span>
										)}
										<span className="flex items-center gap-1">
											<Star className="h-3 w-3" />
											{repo.stargazersCount}
										</span>
										<span className="flex items-center gap-1">
											<GitBranch className="h-3 w-3" />
											{repo.forksCount}
										</span>
									</div>

									<div className="text-xs text-gray-500">
										Cập nhật: {formatDate(repo.updatedAt)}
									</div>

									<div className="flex gap-2 pt-2">
										<Button 
											size="sm" 
											className="flex-1"
											onClick={() => handleImportRepo(repo)}
										>
											<Download className="h-3 w-3 mr-1" />
											Import
										</Button>
										<Button 
											size="sm" 
											variant="outline"
											onClick={() => window.open(repo.htmlUrl, '_blank')}
										>
											<ExternalLink className="h-3 w-3" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}