"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode, Server, Database } from "lucide-react";

const templates = [
	{
		id: "nextjs",
		name: "Next.js",
		description: "React framework với SSR và SSG",
		icon: FileCode,
		color: "bg-blue-500/10 text-blue-600",
	},
	{
		id: "nestjs",
		name: "NestJS",
		description: "Node.js framework cho backend",
		icon: Server,
		color: "bg-red-500/10 text-red-600",
	},
	{
		id: "docker",
		name: "Docker",
		description: "Ứng dụng container hóa",
		icon: Database,
		color: "bg-cyan-500/10 text-cyan-600",
	},
];

const deploymentSteps = [
	{ step: 1, text: "Kết nối repository...", icon: "🔗" },
	{ step: 2, text: "Phân tích cấu hình...", icon: "⚙️" },
	{ step: 3, text: "Xây dựng ứng dụng...", icon: "🔨" },
	{ step: 4, text: "Triển khai lên đám mây...", icon: "☁️" },
	{ step: 5, text: "Hoàn tất!", icon: "✅" },
];

export function TemplateLibrary() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [currentStep, setCurrentStep] = useState(0);

	const handleTemplateSelect = (templateId: string) => {
		setSelectedTemplate(templateId);
		setCurrentStep(0);

		// Simulate deployment process
		const interval = setInterval(() => {
			setCurrentStep((prev) => {
				if (prev >= deploymentSteps.length - 1) {
					clearInterval(interval);
					return prev;
				}
				return prev + 1;
			});
		}, 1500);

		return () => clearInterval(interval);
	};

	return (
		<section id="templates" className="space-section bg-porcelain">
			<div className="container-page">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 30 }}
					animate={{
						opacity: isInView ? 1 : 0,
						y: isInView ? 0 : 30,
					}}
					transition={{ duration: 0.8 }}
				>
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
							Thư viện mẫu
						</h2>
						<p className="text-body-lg text-charcoal/70 max-w-2xl mx-auto">
							Chọn template và xem demo quy trình triển khai ngay lập tức
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
						{/* Template Selection */}
						<div className="space-y-6">
							{templates.map((template, index) => {
								const Icon = template.icon;
								return (
									<motion.div
										key={template.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{
											opacity: isInView ? 1 : 0,
											x: isInView ? 0 : -20,
										}}
										transition={{ delay: index * 0.1, duration: 0.5 }}
									>
										<Card
											className={`cursor-pointer transition-all duration-300 rounded-3xl border-0 shadow-misty hover:shadow-misty-lg ${
												selectedTemplate === template.id
													? "bg-porcelain/90 shadow-misty-lg"
													: "bg-porcelain/70 hover:bg-porcelain/80"
											}`}
											onClick={() => handleTemplateSelect(template.id)}
										>
											<CardContent className="p-8 flex items-center gap-4">
												<div className={`h-12 w-12 rounded-xl flex items-center justify-center ${template.color}`}>
													<Icon className="h-6 w-6" />
												</div>
												<div className="flex-1">
													<h3 className="font-semibold text-charcoal mb-1">{template.name}</h3>
													<p className="text-sm text-charcoal/60">{template.description}</p>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>

						{/* Deployment Demo */}
						<div className="bg-porcelain/60 backdrop-blur-sm rounded-3xl p-10 border border-white/30 shadow-misty">
							<h3 className="font-semibold text-charcoal mb-6">Quy trình triển khai</h3>
							{selectedTemplate ? (
								<div className="space-y-4">
									{deploymentSteps.map((step, index) => (
										<motion.div
											key={step.step}
											initial={{ opacity: 0, x: 20 }}
											animate={{
												opacity: currentStep >= index ? 1 : 0.3,
												x: currentStep >= index ? 0 : 20,
											}}
											transition={{ duration: 0.5 }}
											className={`flex items-center gap-4 p-5 rounded-xl ${
												currentStep >= index
													? "bg-misty-sage/10 border border-white/30"
													: "bg-misty-grey/5"
											}`}
										>
											<span className="text-2xl">{step.icon}</span>
											<span
												className={`font-medium ${
													currentStep >= index ? "text-charcoal" : "text-charcoal/40"
												}`}
											>
												{step.text}
											</span>
										</motion.div>
									))}
									{currentStep >= deploymentSteps.length - 1 && (
										<motion.div
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											className="mt-6 p-4 bg-misty-sage/10 rounded-lg border border-misty-sage/20"
										>
											<p className="text-sm text-charcoal/70">
												✅ Ứng dụng đã được triển khai thành công!
											</p>
											<p className="text-xs text-misty-sage mt-2">https://app.easydeploy.dev</p>
										</motion.div>
									)}
								</div>
							) : (
								<div className="flex items-center justify-center h-full min-h-[300px] text-charcoal/40">
									<p>Chọn một template để xem demo</p>
								</div>
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

