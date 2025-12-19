"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplicationsTable from "@/components/tables/ApplicationsTable";
import { EmptyState } from "@/components/apps/EmptyState";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AppsListPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
			>
				<div>
					<h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-2">
						Ứng dụng của bạn
					</h1>
					<p className="text-charcoal/70">
						Quản lý, redeploy và xem log
					</p>
				</div>
				<Button
					asChild
					size="lg"
					className="bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)] rounded-full px-6 relative overflow-hidden group"
				>
					<Link href="/apps/new" className="gap-2">
						{/* Inner glow effect */}
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						<Plus className="h-5 w-5 relative z-10" strokeWidth={1.5} />
						<span className="relative z-10">Deploy mới</span>
					</Link>
				</Button>
			</motion.div>

			{/* Applications Table */}
			<ApplicationsTable />
		</div>
	);
}
