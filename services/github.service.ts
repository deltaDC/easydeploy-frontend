import api from "./api";
import { API_ENDPOINTS } from "@/utils/constants";
import { createGitHubParams, createApiUrl } from "@/utils/github.utils";

export const GithubService = {
	getOAuthUrl: async () => {
		const response = await api.get("/auth/github/authorize");
		return response.data;
	},

	handleCallback: async (code: string, state?: string) => {
		const params = createGitHubParams(code, state);
		const response = await api.get(`${API_ENDPOINTS.github.callback}?${params.toString()}`);
		return response.data;
	},

	handleApiCallback: async (code: string, state?: string) => {
		const params = createGitHubParams(code, state);
		const url = createApiUrl(`${API_ENDPOINTS.github.callback}?${params.toString()}`);
		
		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
		});
		
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		
		return await response.json();
	},

	getLinkUrl: async () => {
		const response = await api.post("/auth/github/link");
		return response.data;
	},

	handleLinkCallback: async (code: string, state?: string) => {
		const params = createGitHubParams(code, state);
		const response = await api.post(`${API_ENDPOINTS.github.callback}?${params.toString()}`);
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
		const response = await api.get(API_ENDPOINTS.github.installUrl);
		return response.data;
	},

	handleInstallationCallback: async (code: string, installationId: string, state?: string) => {
		const params = createGitHubParams(code, state, installationId);
		const response = await api.get(`/github/installation/callback?${params.toString()}`);
		return response.data;
	},

	getUserInstallations: async () => {
		const response = await api.get(API_ENDPOINTS.github.installations);
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
		const response = await api.get(API_ENDPOINTS.github.repositories);
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
