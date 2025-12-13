"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { BackgroundElements } from "./BackgroundElements";
import { AnimatedText } from "./AnimatedText";

export function HeroSection() {
	const [isVisible, setIsVisible] = useState(false);
	const heroRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	return (
		<section
			ref={heroRef}
			className="relative min-h-[90vh] flex items-center justify-center overflow-hidden space-section"
		>
			{/* Background Elements */}
			<BackgroundElements />

			{/* Content */}
			<div className="container-page relative z-10">
				<div
					className={`grid gap-8 text-center transition-all duration-700 ${
						isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
					}`}
				>
					{/* Logo/Icon */}
					<div
						className={`mx-auto h-20 w-20 bg-primary rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 delay-200 ${
							isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
						}`}
					>
						<Zap className="h-10 w-10 text-primary-foreground animate-pulse-slow" />
					</div>

					{/* Heading */}
					<div className="space-y-6">
						<h1 className="text-h1 mx-auto max-w-5xl">
							<AnimatedText
								text="Triển khai web app nhanh chóng với"
								delay={300}
								className="block mb-2"
							/>
							<AnimatedText
								text="EasyDeploy"
								delay={600}
								className="block text-primary"
							/>
						</h1>

						<p
							className={`mx-auto max-w-2xl text-body-lg text-muted-foreground transition-all duration-500 delay-700 ${
								isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
							}`}
						>
							Kết nối GitHub hoặc sử dụng Docker image. Hệ thống tự động build và triển khai, trả về URL công khai ngay lập tức.
						</p>
					</div>

					{/* CTA Buttons */}
					<div
						className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 delay-1000 ${
							isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
						}`}
					>
						<Button
							asChild
							size="lg"
							className="group gap-2 text-lg px-8 py-6 hover-lift hover-glow"
						>
							<Link href="/login">
								Bắt đầu miễn phí
								<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
							</Link>
						</Button>
						<Button
							variant="outline"
							size="lg"
							asChild
							className="text-lg px-8 py-6 hover-lift border-2"
						>
							<Link href="/apps">Xem Bảng điều khiển</Link>
						</Button>
					</div>

					{/* Stats Preview */}
					<div
						className={`grid grid-cols-3 gap-8 mt-16 pt-16 border-t transition-all duration-500 delay-1200 ${
							isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
						}`}
					>
						<div className="space-y-2">
							<div className="text-3xl font-bold text-primary">100%</div>
							<div className="text-sm text-muted-foreground">Tự động hóa</div>
						</div>
						<div className="space-y-2">
							<div className="text-3xl font-bold text-primary">&lt; 5 phút</div>
							<div className="text-sm text-muted-foreground">Triển khai nhanh</div>
						</div>
						<div className="space-y-2">
							<div className="text-3xl font-bold text-primary">24/7</div>
							<div className="text-sm text-muted-foreground">Giám sát liên tục</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
