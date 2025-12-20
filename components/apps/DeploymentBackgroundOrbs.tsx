"use client";
import { motion } from "framer-motion";

export function DeploymentBackgroundOrbs() {
	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
			{/* Mint Green Orb */}
			<motion.div
				className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"
				animate={{
					x: [0, 30, 0],
					y: [0, -20, 0],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Soft Blue Orb */}
			<motion.div
				className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-soft-blue/20 rounded-full blur-3xl"
				animate={{
					x: [0, -25, 0],
					y: [0, 15, 0],
					scale: [1, 1.15, 1],
				}}
				transition={{
					duration: 12,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 2,
				}}
			/>

			{/* Misty Sage Orb */}
			<motion.div
				className="absolute top-1/2 right-1/3 w-72 h-72 bg-misty-sage/15 rounded-full blur-3xl"
				animate={{
					x: [0, 20, 0],
					y: [0, 25, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 4,
				}}
			/>
		</div>
	);
}


