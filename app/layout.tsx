import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "EasyDeploy",
	description: "Deploy web apps from GitHub or Docker with ease",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<body className="min-h-svh antialiased">
				<header className="border-b border-slate-200 bg-white/80 backdrop-blur">
					<div className="container-page flex h-16 items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="inline-block h-7 w-7 rounded bg-sky-500" />
							<Link href="/" className="text-base font-semibold">EasyDeploy</Link>
						</div>
						<nav className="text-sm">
							<Link className="btn btn-outline" href="/apps">Dashboard</Link>
						</nav>
					</div>
				</header>
				<main className="container-page py-10">{children}</main>
			</body>
		</html>
	);
}
