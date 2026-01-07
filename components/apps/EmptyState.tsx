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
					{/* Elegant Line Art Illustration */}
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
							<defs>
								<linearGradient id="lineArtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" stopColor="#92AFAD" stopOpacity="0.4" />
									<stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.6" />
									<stop offset="100%" stopColor="#92AFAD" stopOpacity="0.3" />
								</linearGradient>
								<linearGradient id="mistGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" stopColor="#B9C9D6" stopOpacity="0.1" />
									<stop offset="100%" stopColor="#92AFAD" stopOpacity="0.05" />
								</linearGradient>
							</defs>
							
							{/* Misty background orbs - very subtle */}
							<circle cx="50" cy="50" r="35" fill="url(#mistGradient)" />
							<circle cx="150" cy="80" r="30" fill="url(#mistGradient)" />
							<circle cx="100" cy="140" r="25" fill="url(#mistGradient)" />
							
							{/* Elegant curved stem - thin line art */}
							<motion.path
								d="M 100 180 Q 95 140 100 100 Q 105 60 100 30"
								stroke="url(#lineArtGradient)"
								strokeWidth="1.5"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								initial={{ pathLength: 0, opacity: 0.5 }}
								animate={{ pathLength: 1, opacity: 0.7 }}
								transition={{ duration: 1.5, delay: 0.3 }}
							/>
							
							{/* Minimalist leaves - line art style */}
							<motion.g
								initial={{ opacity: 0 }}
								animate={{ opacity: 0.6 }}
								transition={{ duration: 0.8, delay: 1 }}
							>
								{/* Left leaf - curved line */}
								<path
									d="M 100 30 Q 75 25 70 50 Q 80 40 90 45 Q 95 35 100 30"
									stroke="url(#lineArtGradient)"
									strokeWidth="1"
									fill="none"
									strokeLinecap="round"
								/>
								{/* Right leaf - curved line */}
								<path
									d="M 100 30 Q 125 25 130 50 Q 120 40 110 45 Q 105 35 100 30"
									stroke="url(#lineArtGradient)"
									strokeWidth="1"
									fill="none"
									strokeLinecap="round"
								/>
								{/* Top leaf - minimal curve */}
								<path
									d="M 100 30 Q 100 15 95 12 Q 100 14 105 12 Q 100 15 100 30"
									stroke="url(#lineArtGradient)"
									strokeWidth="1"
									fill="none"
									strokeLinecap="round"
								/>
							</motion.g>
							
							{/* Subtle dew drops - minimal */}
							<motion.circle
								cx="80"
								cy="50"
								r="2"
								fill="url(#lineArtGradient)"
								initial={{ opacity: 0 }}
								animate={{ opacity: [0, 0.5, 0] }}
								transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
							/>
							<motion.circle
								cx="120"
								cy="55"
								r="1.5"
								fill="url(#lineArtGradient)"
								initial={{ opacity: 0 }}
								animate={{ opacity: [0, 0.5, 0] }}
								transition={{ duration: 3, repeat: Infinity, delay: 2 }}
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
							<h3 className="text-2xl font-bold text-charcoal">
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

