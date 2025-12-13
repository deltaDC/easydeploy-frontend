"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
	text: string;
	delay?: number;
	className?: string;
}

export function AnimatedText({ text, delay = 0, className }: AnimatedTextProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, delay);

		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<span
			className={cn(
				"inline-block transition-all duration-700",
				isVisible
					? "opacity-100 translate-y-0"
					: "opacity-0 translate-y-4",
				className
			)}
		>
			{text}
		</span>
	);
}
