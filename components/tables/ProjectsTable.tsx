"use client";
import { useState } from "react";

export default function ProjectsTable() {
	const [query, setQuery] = useState("");
	const [view, setView] = useState<"list" | "grid">("list");

	return (
		<div className="grid gap-3">
			{/* Toolbar */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<input className="input" placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="input">
						<option>All</option>
						<option>Running</option>
						<option>Error</option>
					</select>
				</div>
				<div className="flex items-center gap-2">
					<button className={`btn btn-outline ${view === "list" ? "ring-1 ring-slate-300" : ""}`} onClick={() => setView("list")}>List</button>
					<button className={`btn btn-outline ${view === "grid" ? "ring-1 ring-slate-300" : ""}`} onClick={() => setView("grid")}>Grid</button>
				</div>
			</div>

			{/* Content */}
			{view === "list" ? (
				<div className="overflow-hidden rounded-lg border border-slate-200">
					<table className="w-full text-sm">
						<thead className="bg-slate-50 text-left">
							<tr>
								<th className="p-3">Service name</th>
								<th className="p-3">Status</th>
								<th className="p-3">Runtime</th>
								<th className="p-3">Region</th>
								<th className="p-3">Deployed</th>
							</tr>
						</thead>
						<tbody>
							<tr className="hover:bg-slate-50">
								<td className="p-3">example-app</td>
								<td className="p-3">Idle</td>
								<td className="p-3">Docker</td>
								<td className="p-3">local</td>
								<td className="p-3">-</td>
							</tr>
						</tbody>
					</table>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					<div className="card p-4">
						<div className="text-sm font-semibold">example-app</div>
						<div className="muted text-xs">Idle • Docker • local</div>
					</div>
				</div>
			)}
		</div>
	);
}
