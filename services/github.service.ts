import api from "./api";

export const GithubService = {
	// Luồng 1: Đăng nhập/Đăng ký với GitHub OAuth (cũ)
	getOAuthUrl: async () => {
		const response = await api.get("/auth/github/authorize");
		return response.data;
	},

	handleCallback: async (code: string, state?: string) => {
		const params = new URLSearchParams({ code });
		if (state) params.append("state", state);
		
		const response = await api.get(`/auth/github/callback?${params.toString()}`);
		return response.data;
	},

	// Xử lý callback từ API endpoint (khi backend redirect về API thay vì frontend)
	handleApiCallback: async (code: string, state?: string) => {
		const params = new URLSearchParams({ code });
		if (state) params.append("state", state);
		
		// Sử dụng fetch trực tiếp để tránh axios interceptor
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/auth/github/callback?${params.toString()}`, {
			method: 'GET',
			credentials: 'include',
		});
		
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		
		return await response.json();
	},

	// Luồng 2: Liên kết GitHub với account hiện tại
	getLinkUrl: async () => {
		const response = await api.post("/auth/github/link");
		return response.data;
	},

	handleLinkCallback: async (code: string, state?: string) => {
		const params = new URLSearchParams({ code });
		if (state) params.append("state", state);
		
		const response = await api.post(`/auth/github/link/callback?${params.toString()}`);
		return response.data;
	},

	// API khác
	getRepositories: async () => {
		const response = await api.get("/auth/github/repos");
		return response.data;
	},

	disconnectGithub: async () => {
		const response = await api.delete("/auth/github/disconnect");
		return response.data;
	},

	// GitHub Application APIs (mới)
	getAppInstallUrl: async () => {
		const response = await api.get("/github/app/install-url");
		return response.data;
	},

	handleInstallationCallback: async (code: string, installationId: string, state?: string) => {
		const params = new URLSearchParams({ 
			code,
			installation_id: installationId
		});
		if (state) params.append("state", state);
		
		const response = await api.get(`/github/installation/callback?${params.toString()}`);
		return response.data;
	},

	getUserInstallations: async () => {
		const response = await api.get("/github/app/installations");
		return response.data;
	},

	getInstallationAccessToken: async (installationId: number) => {
		const response = await api.get(`/github/app/installations/${installationId}/token`);
		return response.data;
	},

	getInstallationRepositories: async (installationId: number) => {
		const response = await api.get(`/github/app/installations/${installationId}/repositories`);
		return response.data;
	},

	getAllUserRepositories: async () => {
		const response = await api.get("/github/app/repositories/all");
		return response.data;
	},

	deleteInstallation: async (installationId: number) => {
		const response = await api.delete(`/github/app/installations/${installationId}`);
		return response.data;
	},

	isFallbackEmail: (email: string) => {
		return email && email.endsWith("@github.local");
	},

	updateFallbackEmail: async (newEmail: string) => {
		const response = await api.put("/auth/github/update-email", { email: newEmail });
		return response.data;
	},
};

export default GithubService;
