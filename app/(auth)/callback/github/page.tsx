"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GithubService } from "@/services/github.service";
import { useAuthStore } from "@/store/useAuthStore";
import { ErrorAlert } from "@/components/ui/error-alert";

function CallbackInner() {
	const params = useSearchParams();
	const router = useRouter();
	const { login } = useAuthStore();
	const [status, setStatus] = useState("Đang xác thực với GitHub...");
	const [error, setError] = useState<{ message: string; status?: number } | null>(null);

	useEffect(() => {
		const code = params.get("code");
		const state = params.get("state");
		const error = params.get("error");
		
		(async () => {
			try {
				if (error) {
					throw new Error(`GitHub OAuth error: ${error}`);
				}
				
				if (!code) {
					throw new Error("Thiếu authorization code từ GitHub");
				}

				setStatus("Đang xử lý GitHub OAuth callback...");
				
				if (state && state.startsWith("link_")) {
					setStatus("Đây là luồng liên kết GitHub. Vui lòng đăng nhập trước.");
					setTimeout(() => router.replace("/login"), 2000);
					return;
				}

				const response = await GithubService.handleCallback(code, state || undefined);
				
				if (response.token) {
					login({
						id: response.userId,
						email: response.email,
						githubUsername: response.githubUsername,
						avatarUrl: response.avatarUrl,
						roles: new Set(Array.isArray(response.roles) ? response.roles : [response.roles]),
					}, response.token);
					
					setStatus("Đăng nhập GitHub thành công! Đang chuyển hướng...");
					setTimeout(() => router.replace("/apps"), 1500);
				} else {
					throw new Error("Không nhận được token từ server");
				}
			} catch (e: any) {
				console.error('GitHub auth error:', e);
				setError({ 
					message: e.message || "Xác thực GitHub thất bại", 
					status: e.status 
				});
				setStatus("Xác thực thất bại");
				setTimeout(() => router.replace("/login"), 3000);
			}
		})();
	}, [login, params, router]);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="max-w-md w-full space-y-6 p-6">
				<div className="text-center space-y-4">
					<div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
						<svg className="h-6 w-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold">GitHub Authentication</h1>
					<p className="text-sm text-muted-foreground">{status}</p>
				</div>

				{!error && (
					<div className="flex justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				)}

				{error && (
					<ErrorAlert 
						error={error} 
						onRetry={() => {
							setError(null);
							router.replace("/login");
						}}
					/>
				)}
			</div>
		</div>
	);
}

export default function GithubCallbackPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-sm text-muted-foreground">Đang xác thực...</p>
				</div>
			</div>
		}>
			<CallbackInner />
		</Suspense>
	);
}
