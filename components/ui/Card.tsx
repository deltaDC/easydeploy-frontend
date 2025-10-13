import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
	return <div className={clsx("card", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
	return (
		<div className="border-b border-slate-200 p-4">
			<h3 className="text-sm font-semibold">{title}</h3>
			{subtitle ? <p className="mt-0.5 text-xs muted">{subtitle}</p> : null}
		</div>
	);
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={clsx("p-4", className)}>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
	return <div className="border-t border-slate-200 p-4">{children}</div>;
}
