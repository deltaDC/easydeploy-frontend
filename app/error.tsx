"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="grid place-items-center py-20 text-center">
			<div>
				<h2 className="mb-2 text-xl font-semibold text-red-400">Đã xảy ra lỗi</h2>
				<p className="text-white/70 mb-4">{error.message}</p>
				<button onClick={reset} className="inline-flex h-10 items-center rounded border border-white/20 px-4 text-sm hover:bg-white/5">Thử lại</button>
			</div>
		</div>
	);
}
