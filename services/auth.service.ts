import api from "./api";

export const AuthService = {
	login: (payload: { email: string; password: string }) => api.post("/auth/login", payload),
	register: (payload: { name: string; email: string; password: string }) => api.post("/auth/register", payload),
	me: () => api.get("/auth/me"),
	logout: () => api.post("/auth/logout"),
	githubAuthUrl: () => api.get("/auth/github/url"),
};

export default AuthService;
