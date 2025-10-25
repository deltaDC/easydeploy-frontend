export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const ROUTES = {
	login: "/login",
	register: "/register",
	dashboard: "/apps",
};

export const MESSAGES = {
	deploying: "Đang triển khai...",
	running: "Đang chạy",
	error: "Lỗi",
	idle: "Chờ",
};

export const EXTERNAL_URLS = {
	github: {
		settings: "https://github.com/settings/installations",
		profile: "https://github.com/settings/profile",
		appInstall: "https://github.com/apps/easydeploy-app/installations/new",
	},
};

export const API_ENDPOINTS = {
	base: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
	github: {
		callback: "/auth/github/callback",
		authStatus: "/auth/github/auth-status",
		installUrl: "/github/app/install-url",
		installations: "/github/app/installations",
		repositories: "/github/app/repositories/all",
	},
};