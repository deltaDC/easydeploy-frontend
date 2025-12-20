"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Settings, Rocket, CheckCircle, Hand, Cloud, Zap, Key } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
	{
		icon: Hand,
		visualIcon: Github,
		title: "Kết nối GitHub",
		description: "Đăng nhập và kết nối tài khoản GitHub của bạn. Chọn repository muốn triển khai.",
		visual: "Bàn tay chạm bề mặt kính mờ",
	},
	{
		icon: Cloud,
		visualIcon: Settings,
		title: "Cấu hình",
		description: "Thiết lập build command, start command, và các biến môi trường cần thiết.",
		visual: "Thông số cấu hình như đám mây lơ lửng",
	},
	{
		icon: Zap,
		visualIcon: Rocket,
		title: "Triển khai",
		description: "Hệ thống tự động build và deploy ứng dụng của bạn. Chỉ cần chờ vài phút.",
		visual: "Biểu tượng sấm sét mờ (code → URL)",
	},
	{
		icon: Key,
		visualIcon: CheckCircle,
		title: "Hoàn tất",
		description: "Nhận URL công khai và bắt đầu sử dụng ứng dụng của bạn ngay lập tức.",
		visual: "Chìa khóa SSL bằng bạc",
	},
];

export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="space-section bg-porcelain">
			<div className="container-page">
				<div className="text-center mb-20">
					<h2 className="font-serif text-4xl md:text-5xl font-semibold text-charcoal mb-4">Cách hoạt động</h2>
					<p className="text-body-lg text-charcoal/70 max-w-2xl mx-auto">
						Quy trình đơn giản chỉ với 4 bước để có ứng dụng của bạn online
					</p>
				</div>

				<div className="relative">
					{/* Connection Line - Soft gradient, no hard line */}
					<div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-misty-sage/20 to-transparent -translate-y-1/2" />

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
						{steps.map((step, index) => (
							<StepCard
								key={index}
								step={step}
								stepNumber={index + 1}
								delay={index * 0.15}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function StepCard({
	step,
	stepNumber,
	delay,
}: {
	step: typeof steps[0];
	stepNumber: number;
	delay: number;
}) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const Icon = step.icon;
	const VisualIcon = step.visualIcon;

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
			animate={{
				opacity: isInView ? 1 : 0,
				y: isInView ? 0 : 30,
				filter: isInView ? "blur(0px)" : "blur(10px)",
			}}
			transition={{ duration: 0.8, delay }}
			className="relative"
		>
			<Card className="h-full bg-porcelain/80 backdrop-blur-md border-0 shadow-misty hover:shadow-misty-lg transition-all duration-300 rounded-3xl text-center relative overflow-hidden">
				{/* Inner Glow */}
				<div className="absolute inset-0 shadow-inner-glow-soft pointer-events-none rounded-3xl" />
				{/* Step Number - Large, Thin, 50% Opacity */}
				<div className="absolute -top-8 -right-8 text-[120px] font-extralight text-misty-sage/20 leading-none pointer-events-none">
					{stepNumber}
				</div>

				<CardContent className="pt-12 pb-10 px-8">
					{/* Visual Icon with Glass Effect */}
					<div className="relative mb-8">
						<div className="mx-auto h-20 w-20 bg-misty-sage/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
							<VisualIcon className="h-10 w-10 text-misty-sage" strokeWidth={1.5} />
						</div>
						{/* Floating effect */}
						<motion.div
							animate={{
								y: [0, -8, 0],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
								delay: delay,
							}}
							className="absolute inset-0"
						>
							<div className="mx-auto h-20 w-20 bg-misty-sage/5 rounded-2xl blur-xl" />
						</motion.div>
					</div>

					{/* Content */}
					<h3 className="text-xl font-semibold text-charcoal mb-3">{step.title}</h3>
					<p className="text-body-sm text-charcoal/70 leading-relaxed">{step.description}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}
