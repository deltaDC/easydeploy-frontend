import Link from "next/link";
import { use } from "react";

export default function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
	return (
		<div className="grid gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Ứng dụng #{appId}</h1>
				<div className="flex gap-2">
					<button className="btn btn-outline">Redeploy</button>
					<button className="btn btn-outline" style={{ borderColor: "#fecaca", color: "#b91c1c" }}>Xóa</button>
				</div>
			</div>
			<div className="grid gap-3">
				<div className="card p-5">
					<div className="text-sm muted">Trạng thái</div>
					<div className="mt-1 font-semibold">running</div>
				</div>
				<div className="card p-5">
					<div className="text-sm muted">URL</div>
					<Link href="#" className="text-sky-600">https://app.example.com</Link>
				</div>
			</div>
		</div>
	);
}
