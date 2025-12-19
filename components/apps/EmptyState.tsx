"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
	return (
		<Card className="bg-white/60 backdrop-blur-xl border-0 rounded-3xl shadow-inner-glow-soft relative overflow-hidden">
			<CardContent className="pt-12 pb-12 px-8">
				<div className="flex flex-col items-center justify-center text-center space-y-6">
					{/* Sprouting Plant Illustration */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6 }}
						className="relative w-48 h-48"
					>
						<svg
							viewBox="0 0 200 200"
							className="w-full h-full"
							xmlns="http://www.w3.org/2000/svg"
						>
							{/* Misty background circles */}
							<circle cx="50" cy="50" r="30" fill="#B9C9D6" opacity="0.2" />
							<circle cx="150" cy="80" r="25" fill="#92AFAD" opacity="0.15" />
							<circle cx="100" cy="120" r="20" fill="#EAEAEA" opacity="0.2" />
							
							{/* Ground/Soil */}
							<ellipse cx="100" cy="170" rx="80" ry="20" fill="#92AFAD" opacity="0.3" />
							
							{/* Sprouting stem */}
							<motion.path
								d="M 100 170 Q 95 140 100 110 Q 105 80 100 50"
								stroke="#92AFAD"
								strokeWidth="3"
								fill="none"
								strokeLinecap="round"
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: 1.5, delay: 0.3 }}
							/>
							
							{/* Leaves */}
							<motion.g
								initial={{ opacity: 0, scale: 0 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 1 }}
							>
								{/* Left leaf */}
								<path
									d="M 100 50 Q 80 45 75 60 Q 80 55 85 65 Q 90 60 100 50"
									fill="#A7F3D0"
									opacity="0.6"
									stroke="#92AFAD"
									strokeWidth="1.5"
								/>
								{/* Right leaf */}
								<path
									d="M 100 50 Q 120 45 125 60 Q 120 55 115 65 Q 110 60 100 50"
									fill="#A7F3D0"
									opacity="0.6"
									stroke="#92AFAD"
									strokeWidth="1.5"
								/>
								{/* Top leaf */}
								<path
									d="M 100 50 Q 100 35 95 30 Q 100 32 105 30 Q 100 35 100 50"
									fill="#A7F3D0"
									opacity="0.7"
									stroke="#92AFAD"
									strokeWidth="1.5"
								/>
							</motion.g>
							
							{/* Dew drops */}
							<motion.circle
								cx="85"
								cy="60"
								r="3"
								fill="#B9C9D6"
								opacity="0.8"
								initial={{ opacity: 0 }}
								animate={{ opacity: [0, 0.8, 0] }}
								transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
							/>
							<motion.circle
								cx="115"
								cy="65"
								r="2.5"
								fill="#B9C9D6"
								opacity="0.8"
								initial={{ opacity: 0 }}
								animate={{ opacity: [0, 0.8, 0] }}
								transition={{ duration: 2, repeat: Infinity, delay: 2 }}
							/>
							<motion.circle
								cx="100"
								cy="35"
								r="2"
								fill="#B9C9D6"
								opacity="0.8"
								initial={{ opacity: 0 }}
								animate={{ opacity: [0, 0.8, 0] }}
								transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
							/>
						</svg>
					</motion.div>

					{/* Text Content */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="space-y-3"
					>
						<h3 className="text-2xl font-serif font-semibold text-charcoal">
							Chưa có ứng dụng nào
						</h3>
						<p className="text-charcoal/70 max-w-md">
							Giống như mầm cây trong sương sớm, hãy bắt đầu triển khai ứng dụng đầu tiên của bạn
						</p>
					</motion.div>

					{/* CTA Button */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
					>
						<Button
							asChild
							size="lg"
							className="bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-emerald-md rounded-full px-8"
						>
							<Link href="/apps/new">
								<Plus className="h-5 w-5 mr-2" strokeWidth={1.5} />
								Tạo ứng dụng đầu tiên
							</Link>
						</Button>
					</motion.div>
				</div>
			</CardContent>
		</Card>
	);
}

