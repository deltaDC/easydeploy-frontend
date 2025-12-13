"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
		<Card
			ref={cardRef}
			className={cn(
				"group hover-lift transition-all duration-300 border-2",
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			)}
		>
			<CardHeader className="pb-4">
				<div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 transition-transform duration-300">
					<Icon className="h-7 w-7 text-primary transition-transform group-hover:rotate-6" />
				</div>
				<CardTitle className="text-xl">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription className="text-base leading-relaxed">
					{description}
				</CardDescription>
			</CardContent>
		</Card>
	);
}
