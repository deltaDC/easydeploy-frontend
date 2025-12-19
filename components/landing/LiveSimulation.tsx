"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const generateData = () => {
	return Array.from({ length: 30 }, (_, i) => ({
		name: `${i}`,
		value: Math.sin(i * 0.3) * 30 + 50 + Math.random() * 15,
		traffic: Math.sin(i * 0.2) * 20 + 40 + Math.random() * 10,
	}));
};

export function LiveSimulation() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [data, setData] = useState(generateData());

	useEffect(() => {
		if (!isInView) return;

		const interval = setInterval(() => {
			setData((prev) => {
				const newData = [...prev.slice(1)];
				const lastValue = prev[prev.length - 1].value;
				const lastTraffic = prev[prev.length - 1].traffic;
				newData.push({
					name: `${prev.length}`,
					value: Math.sin(prev.length * 0.3) * 30 + 50 + Math.random() * 15,
					traffic: Math.sin(prev.length * 0.2) * 20 + 40 + Math.random() * 10,
				});
				return newData;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isInView]);

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
					className="max-w-4xl mx-auto"
				>
					<div className="text-center mb-12">
						<h2 className="font-serif text-4xl md:text-5xl font-semibold text-charcoal mb-4">
							Live Simulation
						</h2>
						<p className="text-body-lg text-charcoal/70 max-w-2xl mx-auto">
							Xem dashboard demo trực tiếp ngay trên trang này
						</p>
					</div>

					{/* Dashboard Widget */}
					<div className="bg-porcelain/80 backdrop-blur-md rounded-3xl shadow-misty-xl overflow-hidden border border-white/30 relative">
						{/* Inner Glow */}
						<div className="absolute inset-0 shadow-inner-glow-soft pointer-events-none rounded-3xl" />
						{/* Widget Header */}
						<div className="bg-misty-grey/5 px-6 py-4 border-b border-white/20 relative z-10">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-charcoal">App Performance</h3>
									<p className="text-sm text-charcoal/60">Real-time monitoring</p>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
									<span className="text-sm text-charcoal/60">Live</span>
								</div>
							</div>
						</div>

						{/* Chart Content */}
						<div className="p-8 relative z-10">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								{/* CPU Usage */}
								<div>
									<p className="text-sm text-charcoal/60 mb-2">CPU Usage</p>
									<div className="h-32 w-full min-w-0 min-h-[128px]">
										<ResponsiveContainer width="100%" height="100%" minHeight={128}>
											<AreaChart data={data}>
												<defs>
													<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#92AFAD" stopOpacity={0.3} />
														<stop offset="95%" stopColor="#92AFAD" stopOpacity={0} />
													</linearGradient>
												</defs>
												<Area
													type="monotone"
													dataKey="value"
													stroke="#92AFAD"
													strokeWidth={2}
													fill="url(#colorValue)"
													dot={false}
												/>
											</AreaChart>
										</ResponsiveContainer>
									</div>
								</div>

								{/* Traffic */}
								<div>
									<p className="text-sm text-charcoal/60 mb-2">Traffic</p>
									<div className="h-32 w-full min-w-0 min-h-[128px]">
										<ResponsiveContainer width="100%" height="100%" minHeight={128}>
											<LineChart data={data}>
												<Line
													type="monotone"
													dataKey="traffic"
													stroke="#B9C9D6"
													strokeWidth={2}
													dot={false}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
								<div className="text-center">
									<div className="text-2xl font-bold text-misty-sage">98.5%</div>
									<div className="text-xs text-charcoal/60 mt-1">Uptime</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-misty-sage">1.2s</div>
									<div className="text-xs text-charcoal/60 mt-1">Response</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-misty-sage">2.4K</div>
									<div className="text-xs text-charcoal/60 mt-1">Requests</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

