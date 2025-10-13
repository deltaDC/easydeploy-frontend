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
		(async () => {
			try {
				if (!code) throw new Error("Thiếu code");
				// TODO: exchange code -> tokens via backend
				setStatus("Thành công! Chuyển hướng...");
				setTimeout(() => router.replace("/apps"), 800);
			} catch (e) {
				setStatus("Xác thực thất bại. Vui lòng thử lại.");
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="grid place-items-center py-20 text-center">
			<p className="text-sm text-white/80">{status}</p>
		</div>
	);
}

export default function GithubCallbackPage() {
	return (
		<Suspense fallback={<div className="grid place-items-center py-20 text-center"><p className="text-sm text-white/80">Đang xác thực...</p></div>}>
			<CallbackInner />
		</Suspense>
	);
}
