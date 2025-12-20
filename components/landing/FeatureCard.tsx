"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
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
			{ threshold: 0.1 }
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

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{
				opacity: isVisible ? 1 : 0,
				y: isVisible ? 0 : 20,
				scale: isVisible ? 1 : 0.95,
			}}
			transition={{ duration: 0.5, delay: delay / 1000 }}
			whileHover={{ scale: 1.02, y: -4 }}
			className="h-full"
		>
			<Card className="h-full bg-porcelain/80 backdrop-blur-md border-0 shadow-misty hover:shadow-misty-lg transition-all duration-300 rounded-3xl group relative overflow-hidden">
				{/* Inner Glow */}
				<div className="absolute inset-0 shadow-inner-glow pointer-events-none rounded-3xl" />
				<CardHeader className="pb-4 p-8">
					<div className="h-16 w-16 bg-misty-sage/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-misty-sage/20 transition-colors">
						<Icon className="h-8 w-8 text-misty-sage stroke-[1.5]" />
					</div>
					<CardTitle className="text-xl text-charcoal font-semibold">{title}</CardTitle>
				</CardHeader>
				<CardContent className="px-8 pb-8">
					<CardDescription className="text-base leading-relaxed text-charcoal/70">
						{description}
					</CardDescription>
				</CardContent>
			</Card>
		</motion.div>
	);
}
