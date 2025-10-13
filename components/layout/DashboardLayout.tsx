import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="grid grid-cols-12 gap-6 py-6">
			<aside className="col-span-12 md:col-span-3 lg:col-span-2">
				<nav className="sticky top-4 grid gap-2">
					<Link className="btn btn-outline" href="/apps">Tổng quan</Link>
					<Link className="btn btn-outline" href="/apps">Ứng dụng</Link>
					<Link className="btn btn-outline" href="/logs">Logs</Link>
					<Link className="btn btn-outline" href="/settings">Cài đặt</Link>
				</nav>
			</aside>
			<section className="col-span-12 md:col-span-9 lg:col-span-10">
				{children}
			</section>
		</div>
	);
}
