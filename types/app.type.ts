import type { Repo } from "./repo.type";

export type App = {
	id: string;
	name: string;
	repo?: Repo;
	repoUrl?: string;
	image?: string; // docker image
	url?: string;
	status: "deploying" | "running" | "error" | "idle";
	createdAt?: string;
	updatedAt?: string;
};
