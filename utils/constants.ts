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
