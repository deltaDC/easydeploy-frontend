/**
 * Utility functions for GitHub service
 */

import {API_BASE, API_VERSION} from "@/services/api";

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
	const base = baseUrl || API_BASE + "/" + API_VERSION || "http://localhost:8080/api/v1";
	return `${base}${endpoint}`;
};

/**
 * Parse GitHub URL to extract owner and repo
 * Supports multiple formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - github.com/owner/repo
 * - owner/repo
 */
export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
	try {
		let cleanUrl = url.trim();
		
		// Remove .git suffix if present
		cleanUrl = cleanUrl.replace(/\.git$/, '');
		
		// Extract owner/repo from URL
		const githubPattern = /(?:github\.com\/|https?:\/\/github\.com\/|git@github\.com:)([^\/]+)\/([^\/\s]+)/;
		const match = cleanUrl.match(githubPattern);
		
		if (match) {
			return {
				owner: match[1],
				repo: match[2].replace('.git', ''),
			};
		}
		
		// Try direct owner/repo format
		const parts = cleanUrl.split('/');
		if (parts.length === 2) {
			return {
				owner: parts[0],
				repo: parts[1],
			};
		}
		
		return null;
	} catch (error) {
		console.error("Error parsing GitHub URL:", error);
		return null;
	}
};