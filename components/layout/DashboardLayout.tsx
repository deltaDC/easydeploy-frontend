"use client";
import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-misty-grey/30 via-porcelain to-soft-blue/20 noise-texture">
			{/* Sidebar */}
			<DashboardSidebar />

			{/* Main Content */}
			<main className="ml-[260px] min-h-screen">
				<div className="container-page py-8 px-6">
					{children}
				</div>
			</main>
		</div>
	);
}
