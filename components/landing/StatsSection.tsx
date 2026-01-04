"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import React from "react";

const stats = [
	{ value: 100, suffix: "%", label: "Tự động hóa", duration: 2000 },
	{ value: 5, suffix: " phút", label: "Triển khai nhanh", duration: 2000 },
	{ value: 24, suffix: "/7", label: "Giám sát liên tục", duration: 2000 },
];

function AnimatedNumber({ value, suffix, duration }: { value: number; suffix: string; duration: number }) {
	const [displayValue, setDisplayValue] = React.useState(0);
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });

	React.useEffect(() => {
		if (!isInView) return;

		let startTime: number;
		const animate = (currentTime: number) => {
			if (!startTime) startTime = currentTime;
			const progress = Math.min((currentTime - startTime) / duration, 1);
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			setDisplayValue(Math.floor(easeOutQuart * value));

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				setDisplayValue(value);
			}
		};

		requestAnimationFrame(animate);
	}, [isInView, value, duration]);

	return (
		<span ref={ref}>
			{displayValue}
			{suffix}
		</span>
	);
}

export function StatsSection() {
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{stats.map((stat, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{
									opacity: isInView ? 1 : 0,
									scale: isInView ? 1 : 0.9,
								}}
								transition={{ delay: index * 0.1, duration: 0.5 }}
								className="text-center"
							>
								<div className="text-4xl md:text-5xl font-bold text-misty-sage mb-2">
									<AnimatedNumber
										value={stat.value}
										suffix={stat.suffix}
										duration={stat.duration}
									/>
								</div>
								<div className="text-sm text-charcoal/70">{stat.label}</div>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}

