/**
 * Utility functions for GitHub service
 */

/**
 * Creates URLSearchParams with common GitHub OAuth parameters
 */
export const createGitHubParams = (code: string, state?: string, installationId?: string) => {
	const params = new URLSearchParams({ code });
	if (state) params.append("state", state);
	if (installationId) params.append("installation_id", installationId);
	return params;
};

/**
 * Creates API URL with base URL and endpoint
 */
export const createApiUrl = (endpoint: string, baseUrl?: string) => {
	const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
	return `${base}${endpoint}`;
};
