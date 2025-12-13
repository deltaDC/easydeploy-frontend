"use client";

export function BackgroundElements() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{/* Geometric Shapes */}
			<div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
			<div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl animate-pulse-slow" />
			
			{/* Grid Pattern */}
			<div 
				className="absolute inset-0 opacity-[0.02]"
				style={{
					backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
					backgroundSize: '50px 50px',
				}}
			/>
		</div>
	);
}
