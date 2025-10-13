import { ReactNode } from "react";

export default function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
	return (
		<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
				{description ? <p className="muted text-sm">{description}</p> : null}
			</div>
			{actions ? <div className="flex gap-2">{actions}</div> : null}
		</div>
	);
}
