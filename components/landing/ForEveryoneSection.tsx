"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Briefcase, Rocket } from "lucide-react";

const personas = [
	{
		icon: GraduationCap,
		title: "Sinh viên",
		description: "Triển khai project học tập và portfolio cá nhân một cách dễ dàng",
		color: "from-blue-400/20 to-blue-600/20",
	},
	{
		icon: Briefcase,
		title: "Freelancer",
		description: "Tập trung vào code, để chúng tôi lo phần triển khai",
		color: "from-purple-400/20 to-purple-600/20",
	},
	{
		icon: Rocket,
		title: "Startup",
		description: "MVP nhanh chóng, scale dễ dàng khi cần",
		color: "from-orange-400/20 to-orange-600/20",
	},
];

export function ForEveryoneSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section className="space-section bg-[#F8F9FA]">
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
					<div className="text-center mb-16">
						<h2 className="font-serif text-4xl md:text-5xl font-semibold text-charcoal mb-4">
							Dành cho mọi người
						</h2>
						<p className="text-body-lg text-charcoal/70 max-w-2xl mx-auto">
							Không cần kiến thức DevOps nâng cao, chỉ cần code và deploy
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{personas.map((persona, index) => {
							const Icon = persona.icon;
							return (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 30 }}
									animate={{
										opacity: isInView ? 1 : 0,
										y: isInView ? 0 : 30,
									}}
									transition={{ delay: index * 0.15, duration: 0.6 }}
									whileHover={{ y: -8, scale: 1.02 }}
									className="relative"
								>
									{/* Muted Background with Gradient */}
									<div className={`absolute inset-0 bg-gradient-to-br ${persona.color} rounded-misty blur-xl opacity-50`} />
									
									<div className="relative bg-porcelain rounded-misty p-8 border border-misty-grey/20 shadow-sm hover:shadow-lg transition-all">
										{/* Icon */}
										<div className="mb-6">
											<div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${persona.color} border border-misty-grey/20`}>
												<Icon className="h-8 w-8 text-charcoal/70" strokeWidth={1.5} />
											</div>
										</div>

										{/* Content */}
										<h3 className="text-xl font-semibold text-charcoal mb-3">{persona.title}</h3>
										<p className="text-charcoal/70 leading-relaxed">{persona.description}</p>
									</div>
								</motion.div>
							);
						})}
					</div>
				</motion.div>
			</div>
		</section>
	);
}

