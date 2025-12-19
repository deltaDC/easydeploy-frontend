"use client";

import { motion } from "framer-motion";

export function BackgroundElements() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{/* Enhanced Noise Texture */}
			<div
				className="absolute inset-0 opacity-[0.025]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					backgroundSize: '200px 200px',
				}}
			/>

			{/* Misty Gradient Overlays */}
			<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-soft-blue/10 via-transparent to-misty-sage/5" />

			{/* Floating Misty Circles */}
			<motion.div
				className="absolute top-20 left-10 w-72 h-72 bg-soft-blue/20 rounded-full blur-3xl"
				animate={{
					y: [0, -20, 0],
					x: [0, 10, 0],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="absolute bottom-20 right-10 w-96 h-96 bg-misty-sage/15 rounded-full blur-3xl"
				animate={{
					y: [0, 10, 0],
					x: [0, -10, 0],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 1,
				}}
			/>
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-soft-blue/10 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.3, 0.4, 0.3],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Subtle Grid Pattern */}
			<div
				className="absolute inset-0 opacity-[0.015]"
				style={{
					backgroundImage:
						"linear-gradient(to right, #92AFAD 1px, transparent 1px), linear-gradient(to bottom, #92AFAD 1px, transparent 1px)",
					backgroundSize: "50px 50px",
				}}
			/>
		</div>
	);
}
