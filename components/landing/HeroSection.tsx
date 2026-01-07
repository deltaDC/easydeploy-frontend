"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { BackgroundElements } from "./BackgroundElements";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = Array.from({ length: 20 }, (_, i) => ({
	name: `${i}`,
	value: Math.sin(i * 0.5) * 50 + 50 + Math.random() * 20,
}));

export function HeroSection() {
	const [isVisible, setIsVisible] = useState(false);
	const heroRef = useRef<HTMLElement>(null);
	const demoSectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	const scrollToDemo = () => {
		demoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section
			ref={heroRef}
			className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8F9FA]"
		>
			{/* Background Elements */}
			<BackgroundElements />

			{/* Content */}
			<div className="container-page relative z-10 pt-24">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left: Text Content */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
						transition={{ duration: 0.7 }}
						className="space-y-8 text-center lg:text-left"
					>
						{/* Slogan */}
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: isVisible ? 1 : 0 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className="text-misty-sage font-medium text-sm uppercase tracking-wider"
						>
							Triển khai trong tĩnh lặng
						</motion.p>

						{/* Headline */}
						<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-tight">
							<motion.span
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
								transition={{ delay: 0.3, duration: 0.6 }}
								className="block"
							>
								Triển khai dễ dàng
							</motion.span>
							<motion.span
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
								transition={{ delay: 0.5, duration: 0.6 }}
								className="block text-green-600"
							>
								lên đám mây
							</motion.span>
						</h1>

						{/* Description */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
							transition={{ delay: 0.7, duration: 0.6 }}
							className="text-lg text-charcoal/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
						>
							Kết nối GitHub hoặc sử dụng Docker image. Hệ thống tự động build và triển khai, trả về URL công khai ngay lập tức.
						</motion.p>

						{/* CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
							transition={{ delay: 0.9, duration: 0.6 }}
							className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
						>
							<Button
								asChild
								size="lg"
								variant="success"
								className="rounded-full px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all"
							>
								<Link href="/register">
									Bắt đầu miễn phí
									<ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								asChild
								className="rounded-full px-8 py-6 text-base font-medium shadow-sm hover:shadow-md transition-all"
							>
								<Link href="/login">Đăng nhập ngay</Link>
							</Button>
						</motion.div>
					</motion.div>

					{/* Right: Browser Window */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 30 }}
						animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 30 }}
						transition={{ delay: 0.5, duration: 0.8 }}
						className="relative"
					>
						{/* Browser Window */}
						<div className="bg-porcelain/80 backdrop-blur-md rounded-3xl shadow-misty-xl overflow-hidden border border-white/50">
							{/* Browser Header */}
							<div className="bg-misty-grey/20 px-4 py-3 flex items-center gap-2 border-b border-misty-grey/20">
								<div className="flex gap-2">
									<div className="w-3 h-3 rounded-full bg-red-400/50" />
									<div className="w-3 h-3 rounded-full bg-yellow-400/50" />
									<div className="w-3 h-3 rounded-full bg-green-400/50" />
								</div>
								<div className="flex-1 mx-4 bg-misty-grey/30 rounded-md px-4 py-1.5 text-xs text-charcoal/50">
									app.easydeploy.dev
								</div>
							</div>

							{/* Browser Content - Live Chart */}
							<div className="bg-porcelain p-6 h-[300px]">
								<div className="h-full w-full min-w-0 min-h-[200px]">
									<ResponsiveContainer width="100%" height="100%" minHeight={200}>
										<LineChart data={chartData}>
											<XAxis dataKey="name" hide />
											<YAxis hide />
											<Line
												type="monotone"
												dataKey="value"
												stroke="#92AFAD"
												strokeWidth={2}
												dot={false}
												animationDuration={2000}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
								<div className="mt-4 text-center">
									<div className="inline-flex items-center gap-2 text-sm text-green-600">
										<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
										<span>Ứng dụng đang hoạt động</span>
									</div>
								</div>
							</div>
						</div>

						{/* Colored Soft Shadow */}
						<div className="absolute -inset-6 bg-misty-sage/15 rounded-3xl blur-3xl -z-10" />
					</motion.div>
				</div>

				{/* Demo Section Anchor */}
				<div ref={demoSectionRef} className="absolute -top-24" />
			</div>
		</section>
	);
}
