import { create } from "zustand";

type LogEntry = {
	id: string;
	timestamp: string;
	level: "info" | "warn" | "error";
	message: string;
};

type LogState = {
	logs: Record<string, LogEntry[]>; // appId -> logs
	appendLog: (appId: string, entry: LogEntry) => void;
	clearLogs: (appId: string) => void;
};

export const useLogStore = create<LogState>((set) => ({
	logs: {},
	appendLog: (appId, entry) =>
		set((state) => ({ logs: { ...state.logs, [appId]: [...(state.logs[appId] || []), entry] } })),
	clearLogs: (appId) => set((state) => ({ logs: { ...state.logs, [appId]: [] } })),
}));
