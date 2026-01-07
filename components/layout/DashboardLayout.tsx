"use client";
import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import DashboardSidebar from "./DashboardSidebar";
import { motion } from "framer-motion";

function DashboardContent({ children }: { children: ReactNode }) {
	const { collapsed } = useSidebar();

	return (
		<div className="min-h-screen misty-morning-background relative overflow-hidden">
			{/* Mesh Gradient Base */}
			<div className="fixed inset-0 z-0 mesh-gradient-base" />
			
			{/* Blur Orbs Background - Mesh Gradient Effect */}
			<div className="fixed inset-0 pointer-events-none z-0">
				{/* Mint colored orb - top left */}
				<div className="absolute top-0 left-0 w-[600px] h-[600px] blurred-orb blurred-orb-mint opacity-40" style={{
					background: 'radial-gradient(circle, rgba(209, 250, 229, 0.4), transparent 70%)',
					filter: 'blur(100px)'
				}} />
				{/* Yellow lime orb - center */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blurred-orb opacity-30" style={{
					background: 'radial-gradient(circle, rgba(247, 254, 231, 0.3), transparent 70%)',
					filter: 'blur(120px)'
				}} />
				{/* Sage colored orb - bottom right */}
				<div className="absolute bottom-0 right-0 w-[550px] h-[550px] blurred-orb blurred-orb-sage opacity-35" style={{
					background: 'radial-gradient(circle, rgba(167, 243, 208, 0.35), transparent 70%)',
					filter: 'blur(110px)'
				}} />
				{/* Additional Sage orb - top right */}
				<div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] blurred-orb blurred-orb-sage opacity-25" style={{
					background: 'radial-gradient(circle, rgba(146, 175, 173, 0.25), transparent 70%)',
					filter: 'blur(90px)'
				}} />
			</div>

			{/* Grain/Noise Texture Overlay */}
			<div className="fixed inset-0 z-0 grain-texture opacity-[0.03]" />

			{/* Sidebar */}
			<DashboardSidebar />

			{/* Main Content */}
			<motion.main
				initial={false}
				animate={{ marginLeft: collapsed ? '80px' : '260px' }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="min-h-screen relative z-10"
			>
				<div className="container-page py-8 px-6">
					{children}
				</div>
			</motion.main>
		</div>
	);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<DashboardContent>{children}</DashboardContent>
		</SidebarProvider>
	);
}
