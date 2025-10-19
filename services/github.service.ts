// GitHub service - Backend APIs not implemented yet
// This file is kept for future implementation

import api from "./api";

export const GithubService = {
	// TODO: Implement when backend GitHub APIs are available
	// listRepos: () => api.get("/github/repos"),
	// webhookTest: () => api.post("/github/webhook/test"),
	
	getOAuthUrl: () => {
		const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "your-github-client-id";
		const redirectUri = `${window.location.origin}/callback/github`;
		const scope = "read:user,user:email";
		return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
	},
};

export default GithubService;
