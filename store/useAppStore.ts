import { create } from "zustand";

export type DeployStatus = "idle" | "deploying" | "running" | "error";

export type AppItem = {
	id: string;
	name: string;
	repoUrl?: string;
	url?: string;
	status: DeployStatus;
	updatedAt: string;
};

type AppState = {
	apps: AppItem[];
	setApps: (apps: AppItem[]) => void;
	updateApp: (app: AppItem) => void;
	removeApp: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
	apps: [],
	setApps: (apps) => set({ apps }),
	updateApp: (app) => set((state) => ({
		apps: state.apps.map((a) => (a.id === app.id ? app : a)),
	})),
	removeApp: (id) => set((state) => ({ apps: state.apps.filter((a) => a.id !== id) })),
}));
