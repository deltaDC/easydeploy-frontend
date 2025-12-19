"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface DeploymentStepIndicatorProps {
	currentStep: 'select' | 'configure';
}

const steps = [
	{ id: 'select', label: 'Chọn mã nguồn', number: 1 },
	{ id: 'configure', label: 'Cấu hình & Triển khai', number: 2 },
];

export function DeploymentStepIndicator({ currentStep }: DeploymentStepIndicatorProps) {
	const currentStepIndex = steps.findIndex(step => step.id === currentStep);

	return (
		<div className="bg-white/45 backdrop-blur-[20px] rounded-2xl p-4 border border-white/18 shadow-misty-sage-sm">
			<div className="flex items-center justify-center gap-8">
				{steps.map((step, index) => {
					const isActive = step.id === currentStep;
					const isCompleted = index < currentStepIndex;
					const isUpcoming = index > currentStepIndex;

					return (
						<div key={step.id} className="flex items-center gap-4 flex-1 max-w-xs">
							{/* Step Circle */}
							<div className="relative flex-shrink-0">
								<motion.div
									className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${
										isCompleted
											? 'bg-emerald-500 text-white'
											: isActive
											? 'bg-emerald-200/20 text-emerald-600 border-2 border-emerald-500'
											: 'bg-white/40 text-charcoal/40 border-2 border-charcoal/20'
									}`}
									animate={{
										scale: isActive ? [1, 1.1, 1] : 1,
									}}
									transition={{
										duration: 2,
										repeat: isActive ? Infinity : 0,
									}}
								>
									{isCompleted ? (
										<Check className="h-6 w-6" strokeWidth={2.5} />
									) : (
										<span className="text-lg font-semibold">{step.number}</span>
									)}
								</motion.div>
								{/* Active Glow */}
								{isActive && (
									<motion.div
										className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md -z-10"
										animate={{
											opacity: [0.5, 0.8, 0.5],
											scale: [1, 1.2, 1],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
										}}
									/>
								)}
							</div>

							{/* Step Label */}
							<div className="flex-1 min-w-0">
								<p className={`text-sm font-medium transition-colors ${
									isActive
										? 'text-charcoal'
										: isCompleted
										? 'text-emerald-600'
										: 'text-charcoal/50'
								}`}>
									{step.label}
								</p>
							</div>

							{/* Connector Line */}
							{index < steps.length - 1 && (
								<div className="flex-1 h-0.5 mx-4 relative">
									<div className={`absolute inset-0 transition-colors ${
										isCompleted
											? 'bg-emerald-500'
											: 'bg-charcoal/20'
									}`} />
									{isCompleted && (
										<motion.div
											className="absolute inset-0 bg-emerald-500"
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											transition={{ duration: 0.5 }}
										/>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}


