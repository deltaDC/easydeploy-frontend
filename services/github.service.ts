import api from "./api";

export const GithubService = {
	listRepos: () => api.get("/github/repos"),
	webhookTest: () => api.post("/github/webhook/test"),
};

export default GithubService;
