"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GithubService } from "@/services/github.service";
import { ErrorAlert } from "@/components/ui/error-alert";

function AppCallbackInner() {
	const params = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState("Đang xử lý GitHub App installation...");
	const [error, setError] = useState<{ message: string; status?: number } | null>(null);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (!isClient) return;

		const success = params.get("success");
		const installationId = params.get("installation_id");
		const error = params.get("error");
		
		(async () => {
			try {
				if (error) {
					throw new Error(`GitHub App installation error: ${error}`);
				}
				
				if (success === "true" && installationId) {
					setStatus("GitHub App installation thành công! Đang chuyển hướng...");
					setTimeout(() => router.replace(`/apps/new?success=true&installation_id=${installationId}`), 2000);
				} else {
					throw new Error("Thiếu thông tin installation từ GitHub");
				}
			} catch (e: any) {
				console.error('GitHub App installation error:', e);
				setError({ 
					message: e.message || "GitHub App installation thất bại", 
					status: e.status 
				});
				setStatus("Installation thất bại");
				setTimeout(() => router.replace("/apps/new"), 3000);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isClient]);

	if (!isClient) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-sm text-muted-foreground">Đang xử lý...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
						<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						GitHub App Installation
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						{status}
					</p>
				</div>

				{error && (
					<ErrorAlert 
						error={error}
						onRetry={() => {
							setError(null);
							router.replace("/apps/new");
						}}
					/>
				)}

				{!error && (
					<div className="flex justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function GithubAppCallbackPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-sm text-muted-foreground">Đang tải...</p>
				</div>
			</div>
		}>
			<AppCallbackInner />
		</Suspense>
	);
}
