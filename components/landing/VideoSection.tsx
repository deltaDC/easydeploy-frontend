"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Play } from "lucide-react";

export function VideoSection() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section className="space-section bg-porcelain">
			<div className="container-page">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 30 }}
					animate={{
						opacity: isInView ? 1 : 0,
						y: isInView ? 0 : 30,
					}}
					transition={{ duration: 0.8 }}
					className="max-w-4xl mx-auto"
				>
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
							Xem quy trình triển khai
						</h2>
						<p className="text-body-lg text-charcoal/70 max-w-2xl mx-auto">
							Code được đẩy lên cloud một cách mượt mà và tự động
						</p>
					</div>

					{/* Video Container with Glass Frame */}
					<div className="relative">
						{/* Glass Frame Effect */}
						<div className="absolute -inset-4 bg-gradient-to-br from-misty-sage/20 via-soft-blue/10 to-misty-sage/20 rounded-3xl blur-xl opacity-50" />
						
						<div className="relative bg-misty-grey/10 rounded-misty overflow-hidden border border-misty-grey/30 backdrop-blur-sm">
							{/* Video Placeholder */}
							<div className="aspect-video bg-gradient-to-br from-misty-sage/20 to-soft-blue/20 flex items-center justify-center relative overflow-hidden">
								{/* Animated Code Lines */}
								<div className="absolute inset-0 flex flex-col justify-center items-center gap-2 opacity-20">
									{[...Array(8)].map((_, i) => (
										<motion.div
											key={i}
											initial={{ x: -100, opacity: 0 }}
											animate={{
												x: [0, 100, 0],
												opacity: [0, 1, 0],
											}}
											transition={{
												duration: 3,
												repeat: Infinity,
												delay: i * 0.3,
												ease: "easeInOut",
											}}
											className="h-1 bg-charcoal/30 rounded-full"
											style={{ width: `${60 + i * 10}%` }}
										/>
									))}
								</div>

								{/* Play Button */}
								<motion.div
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
									className="relative z-10 bg-porcelain/90 backdrop-blur-md rounded-full p-6 shadow-xl cursor-pointer border border-misty-grey/30"
								>
									<Play className="h-12 w-12 text-misty-sage fill-misty-sage" />
								</motion.div>

								{/* Cloud Animation */}
								<motion.div
									animate={{
										y: [0, -20, 0],
										opacity: [0.3, 0.5, 0.3],
									}}
									transition={{
										duration: 4,
										repeat: Infinity,
										ease: "easeInOut",
									}}
									className="absolute top-4 right-4 text-4xl"
								>
									☁️
								</motion.div>
							</div>

							{/* Video Info */}
							<div className="p-6 bg-porcelain/50 backdrop-blur-sm border-t border-misty-grey/20">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold text-charcoal mb-1">Triển khai tự động</h3>
										<p className="text-sm text-charcoal/60">Code → Build → Deploy → Live</p>
									</div>
									<div className="text-sm text-misty-sage font-medium">Slow Motion</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

