"use client";

import { FeatureCard } from "./FeatureCard";
import { Zap, Container, Monitor, Users, Github } from "lucide-react";

const features = [
	{
		icon: Zap,
		title: "Tự động hóa CI/CD",
		description: "Clone → Build → Deploy chỉ với vài cú click. Không cần cấu hình phức tạp.",
	},
	{
		icon: Container,
		title: "Hỗ trợ Docker",
		description: "Triển khai bằng Docker image hoặc từ source code. Linh hoạt và mạnh mẽ.",
	},
	{
		icon: Monitor,
		title: "Giám sát thời gian thực",
		description: "Theo dõi trạng thái, log realtime, và nhận cảnh báo khi có sự cố.",
	},
	{
		icon: Users,
		title: "Dành cho mọi người",
		description: "Sinh viên, freelancer, startup. Không cần kiến thức DevOps nâng cao.",
	},
	{
		icon: Github,
		title: "Tích hợp GitHub",
		description: "Kết nối GitHub trong 1 phút. Tự động redeploy khi có commit mới.",
	},
];

export function FeatureGrid() {
	return (
		<section id="features" className="space-section-sm bg-[#F8F9FA]">
			<div className="container-page">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">Tính năng nổi bật</h2>
					<p className="text-body-lg text-charcoal/70 max-w-2xl mx-auto">
						Tất cả công cụ bạn cần để triển khai ứng dụng một cách nhanh chóng và hiệu quả
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => (
						<FeatureCard
							key={index}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
							delay={index * 100}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
