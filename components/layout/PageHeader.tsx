import { ReactNode } from "react";

export default function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
				{description ? <p className="text-muted-foreground">{description}</p> : null}
			</div>
			{actions ? <div className="flex gap-2">{actions}</div> : null}
		</div>
	);
}
