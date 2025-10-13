"use client";
import Link from "next/link";

export default function Navbar() {
	return (
		<div className="border-b border-white/10 bg-black/20 backdrop-blur">
			<div className="container-page flex h-14 items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="inline-block h-6 w-6 rounded bg-emerald-500" />
					<Link href="/" className="text-sm font-semibold">EasyDeploy</Link>
				</div>
				<div className="flex items-center gap-3 text-sm">
					<Link href="/apps" className="hover:text-white">Dashboard</Link>
					<Link href="/login" className="rounded border border-white/20 px-3 py-1 hover:bg-white/5">Đăng nhập</Link>
				</div>
			</div>
		</div>
	);
}
