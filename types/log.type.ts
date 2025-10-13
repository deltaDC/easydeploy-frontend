export type Log = {
	id: string;
	appId: string;
	timestamp: string;
	level: "info" | "warn" | "error";
	message: string;
};
