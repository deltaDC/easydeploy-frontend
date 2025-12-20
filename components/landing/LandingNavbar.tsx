"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function LandingNavbar() {
	const [scrolled, setScrolled] = useState(false);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		setScrolled(latest > 20);
	});

	return (
		<motion.nav
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5 }}
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled
					? "bg-porcelain/70 backdrop-blur-xl shadow-misty-sm border-b border-white/20"
					: "bg-transparent"
			}`}
		>
			<div className="container-page flex h-16 items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 group">
					<div className="h-8 w-8 bg-misty-sage/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
						<span className="text-charcoal font-bold text-sm">ED</span>
					</div>
					<span className="text-lg font-semibold text-charcoal transition-colors group-hover:text-misty-sage">
						EasyDeploy
					</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-6 text-sm">
					<Link
						href="#features"
						className="text-charcoal/70 hover:text-charcoal transition-colors font-medium"
					>
						Tính năng
					</Link>
					<Link
						href="#how-it-works"
						className="text-charcoal/70 hover:text-charcoal transition-colors font-medium"
					>
						Cách hoạt động
					</Link>
					<Link
						href="#templates"
						className="text-charcoal/70 hover:text-charcoal transition-colors font-medium"
					>
						Mẫu
					</Link>
					<Button
						asChild
						variant="outline"
						className="border-misty-sage/30 text-charcoal hover:bg-misty-sage/10 hover:border-misty-sage/50 rounded-full"
					>
						<Link href="/login">Đăng nhập</Link>
					</Button>
					<Button
						asChild
						className="bg-misty-sage hover:bg-misty-sage/90 text-white rounded-full"
					>
						<Link href="/register">Bắt đầu</Link>
					</Button>
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<Button
						variant="ghost"
						size="icon"
						className="text-charcoal"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</Button>
				</div>
			</div>
		</motion.nav>
	);
}
