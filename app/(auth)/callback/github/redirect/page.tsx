"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function RedirectInner() {
	const params = useSearchParams();

	useEffect(() => {
		// Lấy code và state từ URL
		const code = params.get("code");
		const state = params.get("state");
		const error = params.get("error");
		
		// Tạo URL cho frontend callback page
		const callbackUrl = new URL("/callback/github/api-callback", window.location.origin);
		
		if (code) callbackUrl.searchParams.set("code", code);
		if (state) callbackUrl.searchParams.set("state", state);
		if (error) callbackUrl.searchParams.set("error", error);
		
		// Redirect về frontend callback page
		window.location.href = callbackUrl.toString();
	}, [params]);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="text-center space-y-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
				<p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
			</div>
		</div>
	);
}

export default function RedirectPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-sm text-muted-foreground">Đang tải...</p>
				</div>
			</div>
		}>
			<RedirectInner />
		</Suspense>
	);
}
