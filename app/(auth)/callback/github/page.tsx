"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CallbackInner() {
	const params = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState("Đang xác thực với GitHub...");

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

				setStatus("GitHub OAuth callback nhận được...");
				
				// TODO: Backend GitHub OAuth callback API chưa được implement
				// Hiện tại chỉ hiển thị thông báo và redirect về login
				setStatus("GitHub OAuth chưa được cấu hình đầy đủ. Vui lòng đăng nhập bằng email.");
				
				setTimeout(() => router.replace("/login"), 2000);
			} catch (e: any) {
				console.error('GitHub auth error:', e);
				setStatus(`Xác thực thất bại: ${e.message}. Vui lòng thử lại.`);
				setTimeout(() => router.replace("/login"), 3000);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center space-y-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p className="text-sm text-gray-600">{status}</p>
			</div>
		</div>
	);
}

export default function GithubCallbackPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="text-sm text-gray-600">Đang xác thực...</p>
				</div>
			</div>
		}>
			<CallbackInner />
		</Suspense>
	);
}
