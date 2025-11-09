import api from "./api";
import { BuildLog, BuildLogPageResponse } from "@/types/build-log.type";

export const BuildLogService = {
	/**
	 * Get all logs for a specific build
	 */
	getBuildLogs: async (buildId: string): Promise<BuildLog[]> => {
		const response = await api.get(`/build-logs/build/${buildId}`);
		return response.data;
	},

	/**
	 * Get paginated logs for a specific build
	 */
	getBuildLogsPaginated: async (
		appId: string,
		page: number = 0,
		size: number = 100
	): Promise<BuildLogPageResponse> => {
		const response = await api.get(`/build-logs/build/${appId}/page`, {
			params: { page, size },
		});
		return response.data;
	},
};

export default BuildLogService;

