"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Settings, Rocket, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
	{
		icon: Github,
		title: "Kết nối GitHub",
		description: "Đăng nhập và kết nối tài khoản GitHub của bạn. Chọn repository muốn triển khai.",
	},
	{
		icon: Settings,
		title: "Cấu hình",
		description: "Thiết lập build command, start command, và các biến môi trường cần thiết.",
	},
	{
		icon: Rocket,
		title: "Triển khai",
		description: "Hệ thống tự động build và deploy ứng dụng của bạn. Chỉ cần chờ vài phút.",
	},
	{
		icon: CheckCircle,
		title: "Hoàn tất",
		description: "Nhận URL công khai và bắt đầu sử dụng ứng dụng của bạn ngay lập tức.",
	},
];

export function HowItWorksSection() {
	return (
		<section className="space-section">
			<div className="container-page">
				<div className="text-center mb-16">
					<h2 className="text-h2 mb-4">Cách hoạt động</h2>
					<p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
						Quy trình đơn giản chỉ với 4 bước để có ứng dụng của bạn online
					</p>
				</div>

				<div className="relative">
					{/* Connection Line */}
					<div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -translate-y-1/2" />

					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
						{steps.map((step, index) => (
							<StepCard
								key={index}
								step={step}
								stepNumber={index + 1}
								delay={index * 150}
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
	const [isVisible, setIsVisible] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						setIsVisible(true);
					}, delay);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.2 }
		);

		const currentElement = cardRef.current;
		if (currentElement) {
			observer.observe(currentElement);
		}

		return () => {
			if (currentElement) {
				observer.unobserve(currentElement);
			}
		};
	}, [delay]);

	const Icon = step.icon;

	return (
		<Card
			ref={cardRef}
			className={cn(
				"relative text-center hover-lift transition-all duration-300 border-2",
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			)}
		>
			<CardContent className="pt-6">
				{/* Step Number Badge */}
				<div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-elevation-3">
					{stepNumber}
				</div>

				{/* Icon */}
				<div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mt-2">
					<Icon className="h-8 w-8 text-primary" />
				</div>

				{/* Content */}
				<h3 className="text-h4 mb-3">{step.title}</h3>
				<p className="text-body-sm text-muted-foreground leading-relaxed">
					{step.description}
				</p>
			</CardContent>
		</Card>
	);
}
